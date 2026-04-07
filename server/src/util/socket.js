import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import Message from "../models/Message.model.js";
import logger from "./logger.js";

// Store active connections
const activeUsers = new Map(); // userId -> socketId

const parseBoolean = (value, defaultValue) => {
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === "true";
};

const parseOrigins = (value, fallback = []) => {
  if (!value) return fallback;
  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
};

/**
 * Initialize Socket.IO server
 * Throws if JWT_SECRET is not set — the server must not start without it.
 */
export const initializeSocket = (httpServer) => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET environment variable is required but not set");
  }

  const socketCorsOrigins = parseOrigins(process.env.SOCKET_CORS_ORIGINS, [
    process.env.CLIENT_URL || "http://localhost:5173"
  ]);

  const io = new Server(httpServer, {
    cors: {
      origin: socketCorsOrigins,
      credentials: parseBoolean(process.env.SOCKET_CORS_CREDENTIALS, true)
    }
  });

  /**
   * Middleware: Authenticate socket connections
   */
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Authentication required"));
    }

    try {
      const decoded = jwt.verify(token, jwtSecret);
      socket.userId = decoded.userId;
      const user = await User.findById(decoded.userId).select('username').lean();
      if (!user) return next(new Error('User not found'));
      socket.username = user.username;
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  /**
   * Connection handler
   */
  io.on("connection", (socket) => {
    logger.log(`User connected: ${socket.userId} (${socket.id})`);
    
    // Store user's socket ID
    activeUsers.set(socket.userId, socket.id);

    // Notify others that user is online
    socket.broadcast.emit("user_online", {
      userId: socket.userId,
      username: socket.username
    });

    /**
     * Join personal room for private messages
     */
    socket.on("join_room", (data) => {
      const roomName = `user_${socket.userId}`;
      socket.join(roomName);
      logger.log(`${socket.userId} joined room: ${roomName}`);
    });

    /**
     * Send message event
     */
    socket.on("send_message", async (data) => {
      try {
        const { recipientId, content, image, parentMessageId, clientTempId } = data;

        // Create message in database
        let parentMessage = null;
        if (parentMessageId) {
          parentMessage = await Message.findById(parentMessageId);
        }

        const message = await Message.create({
          sender: socket.userId,
          recipient: recipientId,
          content,
          image: image || null,
          parentMessage: parentMessage ? parentMessage._id : null
        });

        // Populate message data
        await message.populate([
          { path: "sender", select: "username profileImage" },
          { path: "recipient", select: "username profileImage" },
          {
            path: "parentMessage",
            select: "content sender recipient createdAt",
            populate: [
              { path: "sender", select: "username profileImage" },
              { path: "recipient", select: "username profileImage" }
            ]
          }
        ]);

        // Send to recipient's room
        const recipientRoom = `user_${recipientId}`;
        io.to(recipientRoom).emit("receive_message", {
          _id: message._id,
          messageId: message._id,
          sender: message.sender,
          recipient: message.recipient,
          content: message.content,
          image: message.image,
          createdAt: message.createdAt,
          isRead: message.isRead,
          parentMessage: message.parentMessage || null
        });

        // Send acknowledgment to sender
        socket.emit("message_sent", {
          messageId: message._id,
          createdAt: message.createdAt,
          clientTempId: clientTempId || null,
          message
        });

        if (activeUsers.has(recipientId)) {
          socket.emit("message_delivered", {
            messageId: message._id,
            clientTempId: clientTempId || null,
            deliveredAt: new Date().toISOString()
          });
        }

        // Notify both users about conversation update
        io.to(recipientRoom).emit("conversation_updated", {
          userId: socket.userId,
          username: socket.username,
          lastMessage: content,
          lastMessageTime: message.createdAt
        });

        socket.emit("conversation_updated", {
          userId: recipientId,
          lastMessage: content,
          lastMessageTime: message.createdAt
        });
      } catch (err) {
        logger.error("Send message error:", err);
        socket.emit("message_error", { 
          message: "Failed to send message",
          error: err.message 
        });
      }
    });

    /**
     * Typing indicator
     */
    socket.on("typing", (data) => {
      const { recipientId } = data;
      const recipientRoom = `user_${recipientId}`;
      io.to(recipientRoom).emit("user_typing", {
        userId: socket.userId,
        username: socket.username
      });
    });

    /**
     * Stop typing indicator
     */
    socket.on("stop_typing", (data) => {
      const { recipientId } = data;
      const recipientRoom = `user_${recipientId}`;
      io.to(recipientRoom).emit("user_stopped_typing", {
        userId: socket.userId
      });
    });

    /**
     * Mark message as read
     */
    socket.on("mark_as_read", async (data) => {
      try {
        const { messageId } = data;
        
        const message = await Message.findByIdAndUpdate(
          messageId,
          { isRead: true },
          { new: true }
        );

        if (message) {
          const senderRoom = `user_${message.sender}`;
          io.to(senderRoom).emit("message_read", {
            messageId: messageId,
            isRead: true
          });
        }
      } catch (err) {
        logger.error("Mark as read error:", err);
      }
    });

    /**
     * Mark conversation as read
     */
    socket.on("mark_conversation_read", async (data) => {
      try {
        const { partnerId } = data;
        if (!partnerId) return;

        const unreadMessages = await Message.find({
          sender: partnerId,
          recipient: socket.userId,
          isRead: false
        }).select("_id");

        if (!unreadMessages.length) return;

        const messageIds = unreadMessages.map((message) => message._id);

        await Message.updateMany(
          { _id: { $in: messageIds } },
          { isRead: true }
        );

        const partnerRoom = `user_${partnerId}`;
        io.to(partnerRoom).emit("messages_read", {
          readerId: socket.userId,
          messageIds
        });
      } catch (err) {
        logger.error("Mark conversation read error:", err);
      }
    });

    /**
     * Start video/audio call request
     */
    socket.on("call_request", (data) => {
      const { recipientId, callType } = data; // callType: 'audio' or 'video'
      const recipientRoom = `user_${recipientId}`;

      io.to(recipientRoom).emit("incoming_call", {
        callerId: socket.userId,
        callerName: socket.username,
        callType: callType,
        callId: data.callId
      });
    });

    /**
     * Accept call
     */
    socket.on("accept_call", (data) => {
      const { callerId, callId } = data;
      const callerRoom = `user_${callerId}`;

      io.to(callerRoom).emit("call_accepted", {
        accepterId: socket.userId,
        accepterName: socket.username,
        callId: callId
      });
    });

    /**
     * Reject/End call
     */
    socket.on("end_call", (data) => {
      const { otherUserId, callId } = data;
      const otherUserRoom = `user_${otherUserId}`;

      io.to(otherUserRoom).emit("call_ended", {
        userId: socket.userId,
        callId: callId
      });
    });

    /**
     * Disconnect handler
     */
    socket.on("disconnect", () => {
      logger.log(`User disconnected: ${socket.userId}`);

      // Remove from active users
      activeUsers.delete(socket.userId);

      // Notify others that user is offline
      socket.broadcast.emit("user_offline", {
        userId: socket.userId
      });
    });

    // Error handler
    socket.on("error", (error) => {
      logger.error(`Socket error for user ${socket.userId}:`, error);
    });
  });

  return io;
};

/**
 * Get active users list
 */
export const getActiveUsers = () => {
  return Array.from(activeUsers.entries()).map(([userId, socketId]) => ({
    userId,
    socketId
  }));
};

/**
 * Check if user is online
 */
export const isUserOnline = (userId) => {
  return activeUsers.has(userId);
};
