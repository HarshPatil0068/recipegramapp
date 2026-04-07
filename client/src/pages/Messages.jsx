import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { fetchConversations, setCurrentConversation } from '../store/slices/messageSlice';
import ConversationList from '../components/messages/ConversationList';
import ChatWindow from '../components/messages/ChatWindow';

const Messages = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { conversations, currentConversation, loading, error } = useSelector((state) => state.messages);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [selectedConversation, setSelectedConversation] = useState(null);

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchConversations());
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const intervalId = setInterval(() => dispatch(fetchConversations()), 45000);
    return () => clearInterval(intervalId);
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    const openConversation = location.state?.openConversation;
    if (openConversation?.userId) {
      setSelectedConversation(openConversation);
      dispatch(setCurrentConversation(openConversation.userId));
    }
  }, [dispatch, location.state]);

  return (
    <div className="page-shell">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[rgb(var(--color-text-faint))]">Inbox</p>
          <h1 className="mt-1 text-3xl font-extrabold text-black">Messages</h1>
          <p className="mt-2 text-sm text-[rgb(var(--color-text-soft))]">Your conversations, replies, and quick recipe talk all in one place.</p>
        </div>
        <div className="hidden md:inline-flex stats-chip">
          <span className="font-bold text-black">{conversations.length}</span>
          conversations
        </div>
      </div>

      <div className="overflow-hidden rounded-[32px] border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <div className="flex h-[calc(100vh-12.5rem)] min-h-[620px] flex-col md:flex-row">
          <div className={`${selectedConversation ? 'hidden md:flex' : 'flex'} w-full md:w-[360px] flex-col border-r border-[rgb(var(--color-border))] bg-white`}>
            <div className="border-b border-[rgb(var(--color-border))] px-5 py-4">
              <p className="text-sm font-semibold text-black">Primary</p>
              <p className="mt-1 text-xs text-[rgb(var(--color-text-soft))]">{conversations.length} conversations</p>
            </div>
            <ConversationList
              conversations={conversations}
              loading={loading}
              error={error}
              selectedConversationId={selectedConversation?.userId || currentConversation?.userId}
              onSelectConversation={(conversation) => {
                setSelectedConversation(conversation);
                dispatch(setCurrentConversation(conversation.userId));
              }}
            />
          </div>

          {selectedConversation ? (
            <ChatWindow
              conversation={selectedConversation}
              onBack={() => {
                setSelectedConversation(null);
                dispatch(setCurrentConversation(null));
              }}
            />
          ) : (
            <div className="hidden flex-1 items-center justify-center bg-[rgb(var(--color-app))] md:flex">
              <div className="max-w-md text-center">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[rgb(var(--color-surface))] shadow-sm">
                  <svg className="h-12 w-12 text-[rgb(var(--color-primary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <h2 className="mt-5 text-3xl font-extrabold text-black">Your messages</h2>
                <p className="mt-2 text-sm leading-6 text-[rgb(var(--color-text-soft))]">
                  Share recipes, ask for cooking tips, or send quick notes without leaving the app.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
