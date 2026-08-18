import React, { useContext } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Home from './pages/Home.jsx';
import SignUp from './pages/Signup.jsx';
import Login from './pages/Login.jsx';
import Network from './pages/Network.jsx';
import Profile from './pages/Profile.jsx';
import Notification from './pages/Notification.jsx';
import Chat from './pages/Chat.jsx';
import { userDataContext } from './context/userContext.jsx';
import { HiLink } from 'react-icons/hi2';

function App() {
  const { userData, loadingUser } = useContext(userDataContext);

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-[#0f0b09] flex flex-col items-center justify-center gap-3 transition-colors">
        <div className="w-11 h-11 rounded-lg bg-gradient-to-tr from-[#E73F1E] via-[#FB6C00] to-[#F9B637] flex items-center justify-center text-white shadow-md shadow-[#FB6C00]/20 animate-pulse">
          <HiLink className="w-5 h-5" />
        </div>
        <p className="text-xs font-bold text-[#E73F1E] dark:text-[#F9B637] tracking-wider uppercase">
          Loading Conexis...
        </p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={userData ? <Home /> : <Navigate to="/login" replace />} />
      <Route path="/signup" element={userData ? <Navigate to="/" replace /> : <SignUp />} />
      <Route path="/login" element={userData ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/network" element={userData ? <Network /> : <Navigate to="/login" replace />} />
      <Route path="/chat" element={userData ? <Chat /> : <Navigate to="/login" replace />} />
      <Route path="/chat/:userId" element={userData ? <Chat /> : <Navigate to="/login" replace />} />
      <Route path="/profile" element={userData ? <Profile /> : <Navigate to="/login" replace />} />
      <Route path="/notification" element={userData ? <Notification /> : <Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
