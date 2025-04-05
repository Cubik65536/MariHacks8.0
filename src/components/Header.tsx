import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-indigo-600">
            StudyStack
          </Link>
          
          <div className="hidden md:flex space-x-8">
            <Link to="/dashboard/audio-notes" className="text-gray-600 hover:text-indigo-600">
              Audio Notes
            </Link>
            <Link to="/dashboard/quiz-cards" className="text-gray-600 hover:text-indigo-600">
              Quiz Cards
            </Link>
            <Link to="/dashboard/schedule" className="text-gray-600 hover:text-indigo-600">
              Schedule
            </Link>
            <Link to="/dashboard/resources" className="text-gray-600 hover:text-indigo-600">
              Resources
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header; 