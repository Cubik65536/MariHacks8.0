import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

const LandingHeader: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo and Brand */}
          <Link to="/" className="flex items-center space-x-2">
            <BookOpen className="w-8 h-8 text-purple-600" />
            <span className="text-xl font-bold text-gray-900">StudyBuddy</span>
          </Link>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            <Link
              to="/login"
              className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-full"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default LandingHeader; 