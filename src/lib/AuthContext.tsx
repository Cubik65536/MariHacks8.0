import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { storageService } from './StorageService';

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  xp: number;
  level: number;
  currentStreak: number;
  lastActivityDate: string;
  longestStreak: number;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    const userData = storageService.getUser(email);
    if (!userData || userData.password !== password) {
      throw new Error('Invalid credentials');
    }
    setUser(userData.user);
  };

  const register = async (username: string, email: string, password: string) => {
    if (storageService.getUser(email)) {
      throw new Error('User already exists');
    }

    const newUser: User = {
      id: Date.now().toString(),
      username,
      email,
      createdAt: new Date().toISOString(),
      xp: 0,
      level: 1,
      currentStreak: 0,
      lastActivityDate: new Date().toISOString(),
      longestStreak: 0,
    };

    storageService.saveUser(email, {
      user: newUser,
      password,
    });
  };

  const logout = () => {
    setUser(null);
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!user) throw new Error('No user logged in');
    
    const updatedUser = { ...user, ...userData };
    storageService.saveUser(user.email, {
      user: updatedUser,
      password: storageService.getUser(user.email)!.password,
    });
    setUser(updatedUser);
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 