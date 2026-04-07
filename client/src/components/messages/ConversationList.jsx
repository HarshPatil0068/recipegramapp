import { useState } from 'react';
import Loading from '../common/Loading';
import { formatDistanceToNow } from '../../utils/helpers';

const ConversationList = ({
  conversations = [],
  loading = false,
  error = null,
  selectedConversationId = null,
  onSelectConversation
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter((conv) =>
    conv.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <div className="text-center py-8 px-4">
          <div className="w-16 h-16 mx-auto mb-4 bg-error-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-error-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-error-600 font-medium text-sm">{error}</p>
          <p className="text-warmGray-500 text-xs mt-2">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto flex flex-col">
      {/* Search Input */}
      <div className="p-4 border-b border-cream-300 sticky top-0 bg-white z-10">
        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-cream-300 bg-cream-50 pl-10 pr-4 py-2.5 text-sm text-warmGray-900 placeholder:text-warmGray-400 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent transition-all"
          />
          <svg
            className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-warmGray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Conversations */}
      {filteredConversations.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-cream-100 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-warmGray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-warmGray-600 font-medium mb-1">
              {searchQuery ? 'No matches found' : 'No messages yet'}
            </p>
            <p className="text-warmGray-400 text-sm">
              {searchQuery ? 'Try a different search term' : 'Start a conversation to see it here'}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white">
          {filteredConversations.map((conversation) => (
            <button
              key={conversation.userId}
              onClick={() => onSelectConversation(conversation)}
              className={`w-full px-4 py-3 border-b border-cream-200 transition-colors duration-150 text-left group ${
                selectedConversationId === conversation.userId
                  ? 'bg-primary-50'
                  : 'hover:bg-cream-100 active:bg-cream-200'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* User Avatar */}
                <div className="shrink-0 relative">
                  <img
                    src={
                      conversation.profileImage ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${conversation.username}`
                    }
                    alt={conversation.username}
                    className="w-14 h-14 rounded-full object-cover border-2 border-cream-200 group-hover:border-primary-300 transition-colors"
                  />
                  {conversation.unreadCount > 0 && (
                    <div className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary-500 rounded-full border-2 border-white" />
                  )}
                </div>

                {/* Conversation Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between mb-1">
                    <h3 className={`font-semibold text-warmGray-900 truncate ${conversation.unreadCount > 0 ? 'font-bold' : ''}`}>
                      {conversation.username}
                    </h3>
                    <span className="text-xs text-warmGray-400 ml-2 shrink-0">
                      {conversation.lastMessageTime
                        ? formatDistanceToNow(new Date(conversation.lastMessageTime))
                        : ''}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className={`text-sm truncate ${conversation.unreadCount > 0 ? 'text-warmGray-900 font-medium' : 'text-warmGray-500'}`}>
                      {conversation.isCurrentUserSender && (
                        <span className="text-warmGray-400 mr-1">You:</span>
                      )}
                      {conversation.lastMessage}
                    </p>
                    {/* Unread Badge */}
                    {conversation.unreadCount > 0 && (
                      <span className="ml-2 inline-flex items-center justify-center min-w-5 h-5 px-1.5 text-xs font-bold rounded-full bg-primary-500 text-white shrink-0">
                        {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConversationList;
