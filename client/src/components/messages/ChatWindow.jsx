import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  addOptimisticMessage,
  clearConversationUnread,
  fetchConversation,
  markMessageAsRead,
  sendMessage
} from '../../store/slices/messageSlice';
import {
  emitStopTyping,
  emitTyping,
  getSocket,
  markConversationReadSocket,
  sendSocketMessage
} from '../../utils/socket';
import MessageItem from './MessageItem';
import Loading from '../common/Loading';

const ChatWindow = ({ conversation, onBack }) => {
  const dispatch = useDispatch();
  const { currentConversation, loading, typing } = useSelector((state) => state.messages);
  const { user } = useSelector((state) => state.auth);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const lastReadMarkerRef = useRef(null);
  const hasTypedRef = useRef(false);
  
  const [messageContent, setMessageContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const currentUserId = user?._id?.toString?.() || user?._id || null;
  const typingUser = typing?.[conversation.userId];
  const lastOwnMessageId = currentConversation.messages
    .slice()
    .reverse()
    .find((message) => {
      const senderId = message?.sender?._id?.toString?.() || message?.sender?._id || message?.sender;
      return senderId && currentUserId && senderId.toString() === currentUserId.toString();
    })?._id;

  // Fetch conversation on load
  useEffect(() => {
    if (conversation.userId) {
      dispatch(fetchConversation({ userId: conversation.userId, currentUserId: user?._id }));
    }
  }, [conversation.userId, dispatch, user?._id]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation.messages]);

  // Handle typing indicator
  useEffect(() => {
    if (!hasTypedRef.current) return;
    if (isTyping) {
      emitTyping(conversation.userId);
    } else {
      emitStopTyping(conversation.userId);
    }
  }, [isTyping, conversation.userId]);

  useEffect(() => {
    if (!conversation.userId || !user?._id) return;

    const unreadMessages = currentConversation.messages.filter(
      (message) => message.sender?._id === conversation.userId && !message.isRead
    );

    if (!unreadMessages.length) return;

    const lastUnreadId = unreadMessages[unreadMessages.length - 1]._id;
    if (lastReadMarkerRef.current === lastUnreadId) return;

    lastReadMarkerRef.current = lastUnreadId;
    const socket = getSocket();
    if (socket?.connected) {
      markConversationReadSocket(conversation.userId);
    } else {
      unreadMessages.forEach((message) => {
        if (message._id && !message.tempId) {
          dispatch(markMessageAsRead(message._id));
        }
      });
    }
    dispatch(clearConversationUnread({ userId: conversation.userId }));
  }, [currentConversation.messages, conversation.userId, dispatch, user?._id]);

  useEffect(() => {
    if (!conversation.userId || !user?._id) return;

    const intervalId = setInterval(() => {
      dispatch(fetchConversation({
        userId: conversation.userId,
        currentUserId: user._id,
        page: 1,
        limit: 25
      }));
    }, 45000);

    return () => clearInterval(intervalId);
  }, [conversation.userId, dispatch, user?._id]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!messageContent.trim()) return;

    const tempId = `temp-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const nowIso = new Date().toISOString();
    const parentMessageId = replyTo && !replyTo.tempId ? replyTo._id : null;

    const optimisticMessage = {
      _id: tempId,
      tempId,
      sender: user,
      recipient: {
        _id: conversation.userId,
        username: conversation.username,
        profileImage: conversation.profileImage
      },
      content: messageContent.trim(),
      image: null,
      createdAt: nowIso,
      isRead: false,
      status: 'sending',
      parentMessage: replyTo
        ? {
            _id: replyTo._id,
            content: replyTo.content,
            sender: replyTo.sender,
            recipient: replyTo.recipient,
            createdAt: replyTo.createdAt
          }
        : null
    };

    dispatch(addOptimisticMessage({
      conversationUserId: conversation.userId,
      message: optimisticMessage,
      conversationMeta: {
        username: conversation.username,
        profileImage: conversation.profileImage
      }
    }));

    const socket = getSocket();
    if (socket?.connected) {
      sendSocketMessage(conversation.userId, messageContent.trim(), null, {
        clientTempId: tempId,
        parentMessageId
      });
    } else {
      dispatch(sendMessage({
        recipientId: conversation.userId,
        content: messageContent.trim(),
        image: null,
        parentMessageId,
        tempId
      }));
    }

    setMessageContent('');
    setIsTyping(false);
    setReplyTo(null);
  };

  return (
    <div className="flex flex-col bg-white h-full md:h-auto md:flex-1">
      {/* Header */}
      <div className="border-b border-cream-300 px-4 sm:px-5 py-3.5 flex items-center justify-between shrink-0 bg-white">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="md:hidden p-2 hover:bg-cream-100 rounded-full transition-all active:scale-95 -ml-2"
            title="Back to conversations"
          >
            <svg
              className="w-5 h-5 text-warmGray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          
          <img
            src={
              conversation.profileImage ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${conversation.username}`
            }
            alt={conversation.username}
            className="w-10 h-10 rounded-full object-cover border border-cream-300"
          />
          <div>
            <h2 className="font-semibold text-warmGray-900 leading-tight">{conversation.username}</h2>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="text-xs text-warmGray-500">Active now</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button className="p-2.5 hover:bg-cream-100 rounded-full transition-all active:scale-95 hidden sm:block" title="Voice call">
            <svg
              className="w-5 h-5 text-warmGray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
          </button>

          <button className="p-2.5 hover:bg-cream-100 rounded-full transition-all active:scale-95 hidden sm:block" title="Video call">
            <svg
              className="w-5 h-5 text-warmGray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-cream-50">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <Loading />
          </div>
        ) : currentConversation.messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center px-4">
              <div className="w-20 h-20 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-warmGray-600 font-medium mb-2">No messages yet</p>
              <p className="text-warmGray-400 text-sm">Start the conversation by saying hi!</p>
            </div>
          </div>
        ) : (
          <>
            {currentConversation.messages.map((message) => (
              <MessageItem
                key={message._id}
                message={message}
                isOwn={(() => {
                  const senderId = message?.sender?._id?.toString?.() || message?.sender?._id || message?.sender;
                  return Boolean(senderId && currentUserId && senderId.toString() === currentUserId.toString());
                })()}
                onReply={setReplyTo}
                isLastOwn={message._id === lastOwnMessageId}
              />
            ))}
            {typingUser && (
              <div className="flex items-center gap-2 px-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-warmGray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-warmGray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-warmGray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-xs text-warmGray-500">{typingUser.username} is typing</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="border-t border-cream-300 p-3 sm:p-4 bg-white shrink-0">
        {replyTo && (
          <div className="mb-3 px-4 py-3 rounded-xl bg-primary-50 border border-primary-200 flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="text-xs font-semibold text-primary-700 mb-1">Replying to {replyTo.sender?.username || 'message'}</div>
              <div className="text-sm text-warmGray-600 truncate">{replyTo.content}</div>
            </div>
            <button
              type="button"
              onClick={() => setReplyTo(null)}
              className="text-warmGray-400 hover:text-warmGray-600 transition-colors p-1"
              title="Cancel reply"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="flex gap-2 items-end">
          <button
            type="button"
            className="p-2.5 hover:bg-cream-100 rounded-full transition-all active:scale-95 shrink-0 mb-0.5"
            title="Attach image"
          >
            <svg
              className="w-5 h-5 text-warmGray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </button>

          <div className="flex-1 relative">
            <input
              type="text"
              value={messageContent}
              onChange={(e) => {
                setMessageContent(e.target.value);
                hasTypedRef.current = true;
                setIsTyping(true);
                if (typingTimeoutRef.current) {
                  clearTimeout(typingTimeoutRef.current);
                }
                typingTimeoutRef.current = setTimeout(() => {
                  setIsTyping(false);
                }, 2000);
              }}
              onBlur={() => setIsTyping(false)}
              placeholder="Type a message..."
              className="w-full rounded-full border border-cream-300 bg-cream-50 pl-4 pr-4 py-2.5 text-sm text-warmGray-900 placeholder:text-warmGray-400 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={!messageContent.trim()}
            className="p-2.5 rounded-full bg-primary-500 text-white font-medium hover:bg-primary-600 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary-500 transition-all shrink-0"
            title="Send message"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2m0 0v-8"
              />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
