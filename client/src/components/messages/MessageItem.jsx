import { formatDistanceToNow } from '../../utils/helpers';

const MessageItem = ({ message, isOwn, onReply, isLastOwn }) => {
  const showSeen = isOwn && isLastOwn && message.isRead;
  const isOptimistic = message.status === 'sending';

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} px-1`}>
      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[75%] sm:max-w-md`}>
        <div
          className={`px-4 py-2.5 rounded-2xl shadow-sm transition-all ${
            isOwn
              ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-br-sm'
              : 'bg-white text-warmGray-900 rounded-bl-sm border border-cream-200'
          } ${isOptimistic ? 'opacity-70' : 'opacity-100'} break-words`}
        >
          {message.parentMessage && (
            <div
              className={`mb-2 px-3 py-2 rounded-xl text-xs border ${
                isOwn
                  ? 'bg-primary-600/50 border-primary-400/30 text-white'
                  : 'bg-cream-50 border-cream-200 text-warmGray-600'
              }`}
            >
              <div className="flex items-center gap-1 mb-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                <span className="font-semibold">
                  {message.parentMessage.sender?.username || 'User'}
                </span>
              </div>
              <div className="truncate opacity-90">{message.parentMessage.content}</div>
            </div>
          )}
          {message.image && (
            <img
              src={message.image}
              alt="Message attachment"
              className="max-w-full rounded-xl mb-2 shadow-sm"
            />
          )}
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>

        <div className={`mt-1.5 flex items-center gap-3 px-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <p className="text-xs text-warmGray-400 font-medium">
            {formatDistanceToNow(new Date(message.createdAt))}
          </p>
          {onReply && !isOptimistic && (
            <button
              type="button"
              onClick={() => onReply(message)}
              className="text-xs text-warmGray-400 hover:text-primary-500 font-medium transition-colors"
            >
              Reply
            </button>
          )}
          {isOptimistic && (
            <span className="text-xs text-warmGray-400 flex items-center gap-1">
              <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Sending
            </span>
          )}
        </div>

        {showSeen && (
          <div className="mt-1 flex items-center gap-1 px-1">
            <svg className="w-3 h-3 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-xs text-primary-500 font-medium">Seen</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageItem;
