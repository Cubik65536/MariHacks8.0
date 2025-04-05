import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

const UserMenu = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  // Calculate XP progress to next level
  const xpForNextLevel = user.level * 20;
  const xpForCurrentLevel = (user.level - 1) * 20;
  const xpProgress = user.xp - xpForCurrentLevel;
  const xpProgressPercentage = (xpProgress / 20) * 100;
  
  // Calculate the stroke-dasharray and stroke-dashoffset for the SVG circle
  const radius = 16; // Radius of the circle
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (xpProgressPercentage / 100) * circumference;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
      >
        <div className="relative w-8 h-8">
          {/* XP Progress Ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="16"
              cy="16"
              r={radius}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="2"
              className="opacity-30"
            />
            <circle
              cx="16"
              cy="16"
              r={radius}
              fill="none"
              stroke="#6366f1"
              strokeWidth="2"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-300 ease-in-out"
            />
          </svg>
          {/* Profile Picture */}
          <div className="absolute inset-0 bg-indigo-100 rounded-full flex items-center justify-center">
            <span className="text-indigo-600 font-medium">
              {user.username.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-start">
          <span>{user.username}</span>
          <span className="text-xs text-gray-500">
            Level {user.level} • {user.xp} XP • {user.currentStreak} day streak 🔥
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
          <div className="px-4 py-2 text-sm text-gray-700 border-b">
            <div className="font-medium">{user.username}</div>
            <div className="text-gray-500">{user.email}</div>
            <div className="mt-1 text-xs text-indigo-600">
              Level {user.level} • {user.xp} XP
            </div>
            <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-indigo-600 h-1.5 rounded-full" 
                style={{ width: `${xpProgressPercentage}%` }}
              ></div>
            </div>
            <div className="mt-1 text-xs text-gray-500">
              {xpProgress} / 20 XP to next level
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-gray-500">Current Streak</span>
              <span className="text-xs font-medium text-orange-500">{user.currentStreak} days 🔥</span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-xs text-gray-500">Longest Streak</span>
              <span className="text-xs font-medium text-orange-500">{user.longestStreak} days</span>
            </div>
          </div>
          
          <button
            onClick={() => {
              setIsOpen(false);
              navigate('/settings');
            }}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Account Settings
          </button>
          
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu; 