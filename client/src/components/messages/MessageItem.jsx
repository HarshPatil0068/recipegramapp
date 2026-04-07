import { formatDistanceToNow } from '../../utils/helpers';
import MessageStatus from './MessageStatus';

const MessageItem = ({ message, isOwn, onReply, isLastOwn }) => {
  const showSeen = isOwn && isLastOwn && message.isRead;
  const isOptimistic = message.status === 'sending';

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} px-1`}>
      <div className={`flex max-w-[84%] flex-col ${isOwn ? 'items-end' : 'items-start'} sm:max-w-md`}>
        <div
          className={`rounded-3xl px-4 py-3 transition ${
            isOwn
              ? 'rounded-br-md bg-[rgb(var(--color-primary))] text-white'
              : 'rounded-bl-md border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] text-[rgb(var(--color-text))]'
          } ${isOptimistic ? 'opacity-75' : 'opacity-100'} break-words shadow-sm`}
        >
          {message.parentMessage && (
            <div
              className={`mb-2 rounded-2xl border px-3 py-2 text-xs ${
                isOwn
                  ? 'border-white/20 bg-white/10 text-white'
                  : 'border-[rgb(var(--color-border))] bg-[rgb(var(--color-app))] text-[rgb(var(--color-text-soft))]'
              }`}
            >
              <div className="mb-1 flex items-center gap-1">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                <span className="font-semibold">{message.parentMessage.sender?.username || 'User'}</span>
              </div>
              <div className="truncate opacity-90">{message.parentMessage.content}</div>
            </div>
          )}

          {message.image && (
            <img src={message.image} alt="Message attachment" className="mb-2 max-w-full rounded-2xl shadow-sm" />
          )}

          <p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p>
        </div>

        <div className={`mt-1.5 flex items-center gap-2 px-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <p className="text-[11px] font-medium text-[rgb(var(--color-text-faint))]">
            {formatDistanceToNow(new Date(message.createdAt))}
          </p>
          {onReply && !isOptimistic && (
            <button
              type="button"
              onClick={() => onReply(message)}
              className="text-[11px] font-semibold text-[rgb(var(--color-text-faint))] transition hover:text-[rgb(var(--color-primary))]"
            >
              Reply
            </button>
          )}
          {isOwn && <MessageStatus status={message.status} isRead={message.isRead} className="h-3.5 w-3.5" />}
        </div>

        {showSeen && (
          <div className="mt-1 flex items-center gap-1 px-1">
            <span className="text-[11px] font-semibold text-[rgb(var(--color-primary))]">Seen</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageItem;
