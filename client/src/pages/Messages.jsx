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
    <div className="h-[calc(100vh-4rem)] flex flex-col md:flex-row bg-cream-50">
      {/* Conversations List - Hidden on mobile when chat is open */}
      <div className={`${selectedConversation ? 'hidden md:flex' : 'flex'} w-full md:w-96 border-r border-cream-300 bg-white shadow-sm flex-col`}>
        <div className="p-5 border-b border-cream-200 bg-white">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-2xl font-bold text-warmGray-900">Messages</h1>
          </div>
          <p className="text-sm text-warmGray-600">
            {conversations.length} {conversations.length === 1 ? 'conversation' : 'conversations'}
          </p>
        </div>
        <ConversationList
          conversations={conversations}
          loading={loading}
          error={error}
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
        <div className="hidden md:flex flex-1 items-center justify-center bg-gradient-to-br from-cream-50 to-primary-50">
          <div className="text-center px-6">
            <div className="w-32 h-32 mx-auto mb-6 bg-primary-100 rounded-full flex items-center justify-center">
              <svg
                className="w-16 h-16 text-primary-500"
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
            <h2 className="text-3xl font-bold text-warmGray-800 mb-3">
              Your Messages
            </h2>
            <p className="text-warmGray-600 text-lg max-w-md mx-auto">
              Select a conversation from the list to start chatting with your friends and share recipes!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
