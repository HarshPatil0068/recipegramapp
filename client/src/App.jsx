import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store/store';
import { ToastProvider } from './context/ToastContext';
import Header from './components/common/Header';
import Navigation from './components/common/Navigation';
import ProtectedRoute from './components/common/ProtectedRoute';
import AuthInitializer from './components/common/AuthInitializer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import PostDetail from './pages/PostDetail';
import Search from './pages/Search';
import Explore from './pages/Explore';
import Messages from './pages/Messages';
import SavedPosts from './pages/SavedPosts';
import Reels from './pages/Reels';
import AIChef from './pages/AIChef';
import './index.css';

const AppLayout = () => {
  const location = useLocation();
  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  return (
    <div className="app-shell">
      {!isAuthPage && <Header />}
      <main className={isAuthPage ? '' : 'pt-4 md:pt-6 pb-20 md:pb-8'}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/profile/:username" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/post/:postId" element={<ProtectedRoute><PostDetail /></ProtectedRoute>} />
          <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
          <Route path="/explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
          <Route path="/reels" element={<ProtectedRoute><Reels /></ProtectedRoute>} />
          <Route path="/saved" element={<ProtectedRoute><SavedPosts /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/ai-chef" element={<ProtectedRoute><AIChef /></ProtectedRoute>} />
        </Routes>
      </main>
      {!isAuthPage && <Navigation />}
    </div>
  );
};

function App() {
  return (
    <Provider store={store}>
      <ToastProvider>
        <AuthInitializer>
          <Router>
            <AppLayout />
          </Router>
        </AuthInitializer>
      </ToastProvider>
    </Provider>
  );
}

export default App;
