import { Outlet, Link } from 'react-router-dom';
import UserMenu from '../components/UserMenu';

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold text-indigo-600">
                StudyBuddy
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
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      <footer className="bg-white shadow mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-gray-500">
            © {new Date().getFullYear()} StudyBuddy. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout; 