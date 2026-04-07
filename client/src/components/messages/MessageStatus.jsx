/**
 * Message Status Indicator Component
 * Shows message delivery status similar to Instagram/WhatsApp
 * - Sending: Clock icon
 * - Sent: Single checkmark (gray)
 * - Delivered: Double checkmark (gray)
 * - Read: Double checkmark (blue)
 */
const MessageStatus = ({ status, isRead, className = '' }) => {
  if (status === 'sending') {
    return (
      <svg
        className={`text-[rgb(var(--color-text-faint))] ${className}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    );
  }

  if (status === 'sent') {
    return (
      <svg
        className={`text-[rgb(var(--color-text-faint))] ${className}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 13l4 4L19 7"
        />
      </svg>
    );
  }

  if (status === 'delivered') {
    return (
      <svg
        className={`text-[rgb(var(--color-text-faint))] ${className}`}
        viewBox="0 0 16 16"
        fill="currentColor"
      >
        <path d="M10.97 4.97a.75.75 0 0 1 1.071 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.235.235 0 0 1 .02-.022z" />
        <path d="M13.97 6.97a.75.75 0 0 1 1.071 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L7.324 10.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.235.235 0 0 1 .02-.022z" />
      </svg>
    );
  }

  if (status === 'read' || isRead) {
    return (
      <svg
        className={`text-[rgb(var(--color-primary))] ${className}`}
        viewBox="0 0 16 16"
        fill="currentColor"
      >
        <path d="M10.97 4.97a.75.75 0 0 1 1.071 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.235.235 0 0 1 .02-.022z" />
        <path d="M13.97 6.97a.75.75 0 0 1 1.071 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L7.324 10.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.235.235 0 0 1 .02-.022z" />
      </svg>
    );
  }

  return null;
};

export default MessageStatus;
