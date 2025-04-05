import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import MainLayout from './layouts/MainLayout';
import Landing from './pages/Landing';
import Home from './pages/Home';
import AudioNotes from './pages/AudioNotes';
import QuizCards from './pages/QuizCards';
import Schedule from './pages/Schedule';
import Resources from './pages/Resources';
import Notes from './pages/Notes';
import Login from './pages/Login';
import Register from './pages/Register';
import Settings from './pages/Settings';

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" />;
  }
  return <>{children}</>;
};

// Root component that uses auth
const AppRoutes = () => {
  const { user } = useAuth();
  
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={!user ? <Landing /> : <Navigate to="/dashboard" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Home />} />
        <Route path="audio-notes" element={<AudioNotes />} />
        <Route path="quiz-cards" element={<QuizCards />} />
        <Route path="schedule" element={<Schedule />} />
        <Route path="resources" element={<Resources />} />
        <Route path="notes" element={<Notes />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
