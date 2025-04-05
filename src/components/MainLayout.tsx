import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

const MainLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link to="/dashboard" className="text-xl font-bold text-purple-600">
                StudyStack
              </Link>
              <nav className="ml-10 space-x-4">
                <Link
                  to="/dashboard/audio-notes"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Audio Notes
                </Link>
                <Link
                  to="/dashboard/quiz-cards"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Quiz Cards
                </Link>
                <Link
                  to="/dashboard/schedule"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Schedule
                </Link>
                <Link
                  to="/dashboard/resources"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Resources
                </Link>
                <Link
                  to="/dashboard/notes"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Notes
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/dashboard/settings"
                className="text-gray-600 hover:text-gray-900"
              >
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      <footer className="bg-white shadow mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-gray-500">
            © {new Date().getFullYear()} StudyStack. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout; 