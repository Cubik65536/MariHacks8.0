import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { storageService } from '../lib/StorageService';
import { CalendarEvent } from '../components/Calendar/EventModal';
import { Todo } from '../components/Todo/TodoList';
import { 
  BookDashed,
  BookOpen, 
  Calendar, 
  CheckSquare, 
  FileTerminal, 
  FileText, 
  Lightbulb, 
  MessageSquare, 
  Settings, 
  Trophy, 
  Zap 
} from 'lucide-react';

// Define interfaces that match the component expectations
interface StorageTodo extends Omit<Todo, 'dueDate'> {
  dueDate?: string;
}

interface StorageCalendarEvent extends Omit<CalendarEvent, 'start' | 'end'> {
  startTime: string;
  endTime: string;
}

const Home: React.FC = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<any[]>([]);
  const [todos, setTodos] = useState<StorageTodo[]>([]);
  const [events, setEvents] = useState<StorageCalendarEvent[]>([]);

  // Load data from StorageService on component mount
  useEffect(() => {
    if (user) {
      // Load notes
      const userNotes = storageService.getNotes(user.id);
      setNotes(userNotes);

      // Load todos
      const userTodos = storageService.getTodos(user.id);
      setTodos(userTodos);

      // Load events
      const userEvents = storageService.getEvents(user.id);
      setEvents(userEvents);
    }
  }, [user]);

  // Filter and sort todos to get the next 3 upcoming tasks
  const upcomingTodos = todos
    .filter(todo => !todo.completed && todo.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 3);

  // Filter events to get only upcoming events
  const upcomingEvents = events
    .filter(event => new Date(event.startTime) > new Date())
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const features = [
    {
      title: 'Notes',
      description: 'Chat with your study buddies',
      icon: <MessageSquare className="w-6 h-6" />,
      link: '/dashboard/notes',
    },
    {
      title: 'Audio Notes',
      description: 'Create and organize your study notes',
      icon: <FileText className="w-6 h-6" />,
      link: '/dashboard/audio-notes',
    },
    {
      title: 'Schedule',
      description: 'Manage your calendar and tasks',
      icon: <Calendar className="w-6 h-6" />,
      link: '/dashboard/schedule',
    },
    {
      title: 'Quiz Cards',
      description: 'Create and study with flashcards',
      icon: <Lightbulb className="w-6 h-6" />,
      link: '/dashboard/quiz-cards',
    },
    {
      title: 'Resources',
      description: 'Customize your experience',
      icon: <BookDashed className="w-6 h-6" />,
      link: '/dashboard/resources',
    },
  ];

  const xpForCurrentLevel = (user?.level || 1) * 20;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Welcome back, {user?.username}!
        </h1>

        {/* Account Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {/* XP/Level */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Level</p>
                <p className="text-2xl font-bold text-gray-900">{user?.level || 1}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-2">
                <Trophy className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${((user?.xp || 0) % 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {user?.xp || 0} XP / {xpForCurrentLevel} XP
              </p>
            </div>
          </div>

          {/* Daily Streak */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Daily Streak</p>
                <p className="text-2xl font-bold text-gray-900">{user?.currentStreak || 0} days</p>
              </div>
              <div className="bg-green-100 rounded-full p-2">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Longest streak: {user?.longestStreak || 0} days
            </p>
          </div>

          {/* Notes Count */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Notes</p>
                <p className="text-2xl font-bold text-gray-900">{notes.length}</p>
              </div>
              <div className="bg-purple-100 rounded-full p-2">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Total notes in your account
            </p>
          </div>

          {/* Upcoming Deadlines */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Upcoming Deadlines</p>
                <p className="text-2xl font-bold text-gray-900">{upcomingTodos.length}</p>
              </div>
              <div className="bg-red-100 rounded-full p-2">
                <CheckSquare className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="mt-2">
              {upcomingTodos.length > 0 ? (
                <ul className="text-xs text-gray-500">
                  {upcomingTodos.map(todo => (
                    <li key={todo.id} className="truncate">
                      {todo.text} - {new Date(todo.dueDate!).toLocaleDateString()}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-500">No upcoming deadlines</p>
              )}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Upcoming Events</p>
                <p className="text-2xl font-bold text-gray-900">{upcomingEvents.length}</p>
              </div>
              <div className="bg-yellow-100 rounded-full p-2">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-2">
              {upcomingEvents.length > 0 ? (
                <ul className="text-xs text-gray-500">
                  {upcomingEvents.slice(0, 3).map(event => (
                    <li key={event.id} className="truncate">
                      {event.title} - {new Date(event.startTime).toLocaleDateString()}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-500">No upcoming events</p>
              )}
            </div>
          </div>
        </div>

        {/* Feature Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Link
              key={index}
              to={feature.link}
              className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 rounded-full p-2 mr-4">
                    {feature.icon}
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {feature.title}
                  </h2>
                </div>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home; 