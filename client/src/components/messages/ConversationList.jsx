import { useState } from 'react';
import Loading from '../common/Loading';
import { formatDistanceToNow } from '../../utils/helpers';

const ConversationList = ({
  conversations = [],
  loading = false,
  error = null,
  selectedConversationId = null,
  onSelectConversation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter((conv) =>
    conv.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="max-w-xs text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
            <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-red-600">{error}</p>
          <p className="mt-1 text-xs text-[rgb(var(--color-text-soft))]">Please try again in a moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="sticky top-0 z-10 border-b border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-4 py-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input w-full rounded-full bg-[rgb(var(--color-app))] pl-11 pr-4 text-sm"
          />
          <svg className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgb(var(--color-text-faint))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {filteredConversations.length === 0 ? (
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="max-w-xs text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[rgb(var(--color-app))]">
              <svg className="h-8 w-8 text-[rgb(var(--color-text-faint))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-black">{searchQuery ? 'No matches found' : 'No messages yet'}</p>
            <p className="mt-1 text-xs text-[rgb(var(--color-text-soft))]">
              {searchQuery ? 'Try a different search term.' : 'Start a conversation to see it here.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-[rgb(var(--color-border))]">
          {filteredConversations.map((conversation) => {
            const selected = selectedConversationId === conversation.userId;

            return (
              <button
                key={conversation.userId}
                onClick={() => onSelectConversation(conversation)}
                className={`w-full px-4 py-3 text-left transition ${
                  selected ? 'bg-[rgb(var(--color-app))]' : 'hover:bg-[rgb(var(--color-app))]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <img
                      src={
                        conversation.profileImage ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${conversation.username}`
                      }
                      alt={conversation.username}
                      className="h-14 w-14 rounded-full object-cover"
                    />
                    {conversation.unreadCount > 0 && (
                      <span className="absolute -right-0.5 -top-0.5 h-4 w-4 rounded-full border-2 border-[rgb(var(--color-surface))] bg-[rgb(var(--color-primary))]" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className={`truncate text-sm ${conversation.unreadCount > 0 ? 'font-bold text-black' : 'font-semibold text-black'}`}>
                        {conversation.username}
                      </h3>
                      <span className="shrink-0 text-[11px] font-medium text-[rgb(var(--color-text-faint))]">
                        {conversation.lastMessageTime ? formatDistanceToNow(new Date(conversation.lastMessageTime)) : ''}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center justify-between gap-3">
                      <p className={`truncate text-sm ${conversation.unreadCount > 0 ? 'font-medium text-[rgb(var(--color-text))]' : 'text-[rgb(var(--color-text-soft))]'}`}>
                        {conversation.isCurrentUserSender && <span className="mr-1 text-[rgb(var(--color-text-faint))]">You:</span>}
                        {conversation.lastMessage}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[rgb(var(--color-primary))] px-1.5 text-[11px] font-bold text-white">
                          {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ConversationList;
