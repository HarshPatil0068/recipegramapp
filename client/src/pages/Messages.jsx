import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { fetchConversations, setCurrentConversation } from '../store/slices/messageSlice';
import ConversationList from '../components/messages/ConversationList';
import ChatWindow from '../components/messages/ChatWindow';

const Messages = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { conversations, currentConversation, loading, error } = useSelector(
    (state) => state.messages
  );
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [selectedConversation, setSelectedConversation] = useState(null);

  // Fetch conversations on mount
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchConversations());
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const intervalId = setInterval(() => {
      dispatch(fetchConversations());
    }, 45000);

    return () => clearInterval(intervalId);
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    const openConversation = location.state?.openConversation;
    if (openConversation?.userId) {
      setSelectedConversation(openConversation);
      dispatch(setCurrentConversation(openConversation.userId));
    }
  }, [dispatch, location.state]);

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    dispatch(setCurrentConversation(conversation.userId));
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
    dispatch(setCurrentConversation(null));
  };

  return (
    <div className="h-[calc(100vh-4rem)] bg-cream-50 p-0 md:p-4">
      <div className="h-full max-w-6xl mx-auto card border border-cream-300 bg-white overflow-hidden flex flex-col md:flex-row">
      {/* Conversations List - Hidden on mobile when chat is open */}
      <div className={`${selectedConversation ? 'hidden md:flex' : 'flex'} w-full md:w-[360px] border-r border-cream-300 bg-white flex-col`}>
        <div className="px-5 py-4 border-b border-cream-300 bg-white">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-warmGray-900">Direct</h1>
            <button className="p-2 rounded-full hover:bg-cream-100 text-warmGray-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-warmGray-500 mt-1">
            {conversations.length} {conversations.length === 1 ? 'conversation' : 'conversations'}
          </p>
        </div>
        <ConversationList
          conversations={conversations}
          loading={loading}
          error={error}
          selectedConversationId={selectedConversation?.userId || currentConversation?.userId}
          onSelectConversation={handleSelectConversation}
        />
      </div>

      {/* Chat Window - Full width on mobile, flex-1 on desktop */}
      {selectedConversation ? (
        <ChatWindow
          conversation={selectedConversation}
          onBack={handleBackToList}
        />
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-cream-50">
          <div className="text-center px-6">
            <div className="w-24 h-24 mx-auto mb-5 bg-primary-100 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-primary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-warmGray-800 mb-2">
              Your Messages
            </h2>
            <p className="text-warmGray-600 max-w-md mx-auto">
              Send private updates, share recipes, and keep conversations in one place.
            </p>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default Messages;
