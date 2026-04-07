import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api.js";

/**
 * Async thunks for message API calls
 */

export const sendMessage = createAsyncThunk(
  "messages/sendMessage",
  async ({ recipientId, content, image, parentMessageId, tempId }, { rejectWithValue }) => {
    try {
      const response = await api.post("/messages", {
        recipientId,
        content,
        image,
        parentMessageId
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to send message");
    }
  }
);

export const fetchConversations = createAsyncThunk(
  "messages/fetchConversations",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/messages");
      return response.conversations;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch conversations");
    }
  }
);

export const fetchConversation = createAsyncThunk(
  "messages/fetchConversation",
  async ({ userId, page = 1, limit = 25 }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/messages/${userId}?page=${page}&limit=${limit}`);
      return {
        userId,
        messages: response.messages,
        page: response.page,
        total: response.total
      };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch conversation");
    }
  }
);

export const markMessageAsRead = createAsyncThunk(
  "messages/markAsRead",
  async (messageId, { rejectWithValue }) => {
    try {
      const response = await api.put(`/messages/${messageId}/read`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to mark message as read");
    }
  }
);

export const deleteMessage = createAsyncThunk(
  "messages/deleteMessage",
  async (messageId, { rejectWithValue }) => {
    try {
      await api.delete(`/messages/${messageId}`);
      return messageId;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to delete message");
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  "messages/fetchUnreadCount",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/messages/unread/count");
      return response.unreadCount;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch unread count");
    }
  }
);

/**
 * Redux slice for messages
 */
const getMessageKey = (message) => message._id || message.tempId;

const applyStatus = (message, currentUserId) => {
  if (!currentUserId) return message;
  if (message?.sender?._id === currentUserId) {
    const status = message.isRead ? "read" : "sent";
    return { ...message, status };
  }

  return message;
};

const mergeMessages = (existing, incoming) => {
  const merged = new Map();
  existing.forEach((message) => {
    merged.set(getMessageKey(message), message);
  });
  incoming.forEach((message) => {
    const key = getMessageKey(message);
    const previous = merged.get(key);
    merged.set(key, previous ? { ...previous, ...message } : message);
  });

  return Array.from(merged.values()).sort((a, b) =>
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
};

const messagesSlice = createSlice({
  name: "messages",
  initialState: {
    conversations: [],
    currentConversation: {
      userId: null,
      messages: [],
      page: 1,
      total: 0,
      loading: false
    },
    typing: {}, // { userId: timestamp }
    onlineUsers: new Set(),
    unreadCount: 0,
    loading: false,
    error: null,
    success: false
  },
  reducers: {
    // WebSocket received message
    addReceivedMessage: (state, action) => {
      const incomingMessage = action.payload;
      const message = incomingMessage._id
        ? incomingMessage
        : { ...incomingMessage, _id: incomingMessage.messageId };
      
      // Add to current conversation if applicable
      if (state.currentConversation.userId) {
        const isSenderInConversation = 
          message.sender._id === state.currentConversation.userId ||
          message.recipient._id === state.currentConversation.userId;

        if (isSenderInConversation) {
          state.currentConversation.messages.push(message);
        }
      }

      // Update conversation in list
      const conversationIndex = state.conversations.findIndex(
        conv => (
          (conv.userId === message.sender._id || conv.userId === message.recipient._id)
        )
      );

      if (conversationIndex > -1) {
        state.conversations[conversationIndex].lastMessage = message.content;
        state.conversations[conversationIndex].lastMessageTime = message.createdAt;
        if (state.currentConversation.userId !== message.sender._id) {
          state.conversations[conversationIndex].unreadCount =
            (state.conversations[conversationIndex].unreadCount || 0) + 1;
        }
        // Move to top
        const [conversation] = state.conversations.splice(conversationIndex, 1);
        state.conversations.unshift(conversation);
      } else {
        const isIncoming = state.currentConversation.userId !== message.sender._id;
        const otherUser = message.sender;
        state.conversations.unshift({
          userId: otherUser._id,
          username: otherUser.username,
          profileImage: otherUser.profileImage,
          lastMessage: message.content,
          lastMessageTime: message.createdAt,
          unreadCount: isIncoming ? 1 : 0,
          isCurrentUserSender: !isIncoming
        });
      }
    },

    addOptimisticMessage: (state, action) => {
      const { conversationUserId, message, conversationMeta } = action.payload;
      if (state.currentConversation.userId === conversationUserId) {
        state.currentConversation.messages.push(message);
      }

      const conversationIndex = state.conversations.findIndex(
        (conv) => conv.userId === conversationUserId
      );
      if (conversationIndex > -1) {
        state.conversations[conversationIndex].lastMessage = message.content;
        state.conversations[conversationIndex].lastMessageTime = message.createdAt;
        const [conversation] = state.conversations.splice(conversationIndex, 1);
        state.conversations.unshift(conversation);
      } else if (conversationMeta) {
        state.conversations.unshift({
          userId: conversationUserId,
          username: conversationMeta.username,
          profileImage: conversationMeta.profileImage,
          lastMessage: message.content,
          lastMessageTime: message.createdAt,
          unreadCount: 0,
          isCurrentUserSender: true
        });
      }
    },

    acknowledgeMessageSent: (state, action) => {
      const { tempId, message } = action.payload;
      const messageIndex = state.currentConversation.messages.findIndex(
        (item) => item.tempId === tempId || item._id === tempId
      );

      if (messageIndex > -1) {
        state.currentConversation.messages[messageIndex] = message;
      } else if (state.currentConversation.userId) {
        state.currentConversation.messages.push(message);
      }
    },

    markMessageDelivered: (state, action) => {
      const { messageId, tempId } = action.payload;
      const message = state.currentConversation.messages.find(
        (item) => item._id === messageId || item.tempId === tempId
      );

      if (message) {
        if (message.status !== "read") {
          message.status = "delivered";
        }
      }
    },

    markMessagesRead: (state, action) => {
      const { messageIds } = action.payload;
      if (!messageIds || !messageIds.length) return;

      state.currentConversation.messages.forEach((message) => {
        if (messageIds.includes(message._id)) {
          message.isRead = true;
          message.status = "read";
        }
      });
    },

    // Update typing status
    setUserTyping: (state, action) => {
      const { userId, username } = action.payload;
      state.typing[userId] = { username, timestamp: Date.now() };
    },

    clearUserTyping: (state, action) => {
      const { userId } = action.payload;
      delete state.typing[userId];
    },

    // User online/offline
    setUserOnline: (state, action) => {
      const { userId } = action.payload;
      state.onlineUsers.add(userId);
    },

    setUserOffline: (state, action) => {
      const { userId } = action.payload;
      state.onlineUsers.delete(userId);
    },

    // Update conversation
    updateConversation: (state, action) => {
      const { userId, lastMessage, lastMessageTime } = action.payload;
      const conversationIndex = state.conversations.findIndex(
        conv => conv.userId === userId
      );

      if (conversationIndex > -1) {
        state.conversations[conversationIndex].lastMessage = lastMessage;
        state.conversations[conversationIndex].lastMessageTime = lastMessageTime;
        // Move to top
        const [conversation] = state.conversations.splice(conversationIndex, 1);
        state.conversations.unshift(conversation);
      }
    },

    clearConversationUnread: (state, action) => {
      const { userId } = action.payload;
      const conversation = state.conversations.find((conv) => conv.userId === userId);
      if (conversation) {
        conversation.unreadCount = 0;
      }
    },

    // Mark message as read (WebSocket)
    markMessageReadWebSocket: (state, action) => {
      const { messageId } = action.payload;
      
      if (state.currentConversation.messages) {
        const message = state.currentConversation.messages.find(m => m._id === messageId);
        if (message) {
          message.isRead = true;
          message.status = "read";
        }
      }
    },

    // Set current conversation
    setCurrentConversation: (state, action) => {
      state.currentConversation.userId = action.payload;
      state.currentConversation.messages = [];
      state.currentConversation.page = 1;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Clear success
    clearSuccess: (state) => {
      state.success = false;
    },

    // Increment unread count
    incrementUnreadCount: (state) => {
      state.unreadCount++;
    },

    // Decrement unread count
    decrementUnreadCount: (state) => {
      if (state.unreadCount > 0) {
        state.unreadCount--;
      }
    }
  },
  extraReducers: (builder) => {
    // Send message
    builder
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const tempId = action.meta?.arg?.tempId || null;
        const messageWithStatus = {
          ...action.payload,
          status: action.payload.isRead ? "read" : "sent"
        };

        if (tempId) {
          const messageIndex = state.currentConversation.messages.findIndex(
            (item) => item.tempId === tempId || item._id === tempId
          );
          if (messageIndex > -1) {
            state.currentConversation.messages[messageIndex] = messageWithStatus;
          } else {
            state.currentConversation.messages.push(messageWithStatus);
          }
        } else {
          state.currentConversation.messages.push(messageWithStatus);
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch conversations
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch conversation
    builder
      .addCase(fetchConversation.pending, (state) => {
        state.currentConversation.loading = true;
        state.error = null;
      })
      .addCase(fetchConversation.fulfilled, (state, action) => {
        state.currentConversation.loading = false;
        const { userId, messages, page, total } = action.payload;
        const currentUserId = action.meta?.arg?.currentUserId || null;
        const normalized = messages.map((message) => applyStatus(message, currentUserId));
        const existingMessages = state.currentConversation.userId === userId
          ? state.currentConversation.messages
          : [];
        const merged = mergeMessages(existingMessages, normalized);
        state.currentConversation.userId = userId;
        state.currentConversation.messages = merged;
        state.currentConversation.page = page;
        state.currentConversation.total = total;
      })
      .addCase(fetchConversation.rejected, (state, action) => {
        state.currentConversation.loading = false;
        state.error = action.payload;
      });

    // Mark as read
    builder
      .addCase(markMessageAsRead.fulfilled, (state, action) => {
        const message = action.payload;
        const messageInList = state.currentConversation.messages.find(
          m => m._id === message._id
        );
        if (messageInList) {
          messageInList.isRead = true;
          messageInList.status = "read";
        }
      });

    // Delete message
    builder
      .addCase(deleteMessage.fulfilled, (state, action) => {
        const messageId = action.payload;
        state.currentConversation.messages = state.currentConversation.messages.filter(
          m => m._id !== messageId
        );
      });

    // Fetch unread count
    builder
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      });
  }
});

export const {
  addReceivedMessage,
  addOptimisticMessage,
  acknowledgeMessageSent,
  markMessageDelivered,
  markMessagesRead,
  setUserTyping,
  clearUserTyping,
  setUserOnline,
  setUserOffline,
  updateConversation,
  clearConversationUnread,
  markMessageReadWebSocket,
  setCurrentConversation,
  clearError,
  clearSuccess,
  incrementUnreadCount,
  decrementUnreadCount
} = messagesSlice.actions;

export default messagesSlice.reducer;
