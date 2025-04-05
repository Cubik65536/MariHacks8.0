import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, CheckSquare, Clock, BookOpen, Mic, Brain } from 'lucide-react';
import LandingHeader from '../components/LandingHeader';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <LandingHeader />
      
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16 text-center">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900 mb-6">
          Skip the grunt work.
          <br />
          <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Focus on learning.
          </span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          StudyStack automates task management, scheduling, and note organization so you can focus on what matters.
        </p>
        <div className="flex gap-4 justify-center mb-16">
          <Link
            to="/register"
            className="px-8 py-3 bg-purple-600 text-white rounded-full font-medium hover:bg-purple-700 transition-colors"
          >
            Try for Free
          </Link>
          <Link
            to="/"
            className="px-8 py-3 bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-colors"
          >
            Learn More
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Calendar & Task Management */}
          <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Calendar Integration</h3>
            <p className="text-gray-600">
              Seamlessly manage your schedule with an intelligent calendar that syncs with your tasks and deadlines.
            </p>
          </div>

          {/* Todo System */}
          <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
              <CheckSquare className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Dynamic Task Management</h3>
            <p className="text-gray-600">
              Prioritize tasks, set deadlines, and track progress with our intuitive todo system.
            </p>
          </div>

          {/* Time Management */}
          <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Time Optimization</h3>
            <p className="text-gray-600">
              AI-powered scheduling suggestions help you make the most of your study time.
            </p>
          </div>

          {/* Note Taking */}
          <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-6">
              <BookOpen className="w-6 h-6 text-yellow-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Note Organization</h3>
            <p className="text-gray-600">
              Keep your notes organized and easily accessible with automatic categorization and tagging.
            </p>
          </div>

          {/* Audio Notes */}
          <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-6">
              <Mic className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Audio Note Taking</h3>
            <p className="text-gray-600">
              Record and transcribe lectures automatically, with key points highlighted for review.
            </p>
          </div>

          {/* Study Analytics */}
          <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-6">
              <Brain className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Study Analytics</h3>
            <p className="text-gray-600">
              Track your progress and identify areas for improvement with detailed analytics.
            </p>
          </div>
        </div>
      </div>

      {/* Demo Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-3xl p-8 md:p-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                See how it works in action
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Watch our demo to see how StudyStack can transform your learning experience and help you achieve better results.
              </p>
              <Link
                to="/"
                className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-full font-medium hover:bg-purple-700 transition-colors"
              >
                Watch Demo
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="relative">
              <div className="aspect-w-16 aspect-h-9 rounded-xl overflow-hidden shadow-xl">
                {/* Replace with your demo video or screenshot */}
                <div className="bg-gray-200 w-full h-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to transform your learning experience?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of students who are already using StudyStack to learn more effectively.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center px-8 py-3 bg-purple-600 text-white rounded-full font-medium hover:bg-purple-700 transition-colors"
          >
            Get Started for Free
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Landing; 