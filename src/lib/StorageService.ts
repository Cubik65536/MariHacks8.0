import { User } from './AuthContext';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  allDay: boolean;
  color: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  category?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface QuizCard {
  id: string;
  question: string;
  answer: string;
  noteId: string;
  userId: string;
  createdAt: string;
  type: 'regular' | 'reverse';
  description?: string;
  concept?: string;
}

interface StorageData {
  users: { [key: string]: { user: User; password: string } };
  notes: Note[];
  events: CalendarEvent[];
  todos: Todo[];
  quizCards: { [key: string]: QuizCard[] };
}

class StorageService {
  private static instance: StorageService;
  private data: StorageData = {
    users: {},
    notes: [],
    events: [],
    todos: [],
    quizCards: {},
  };

  private constructor() {
    this.loadData();
  }

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  private loadData(): void {
    try {
      const usersData = localStorage.getItem('users');
      const notesData = localStorage.getItem('notes');
      const eventsData = localStorage.getItem('events');
      const todosData = localStorage.getItem('todos');
      const quizCardsData = localStorage.getItem('quizCards');

      if (usersData) {
        this.data.users = JSON.parse(usersData);
      }
      if (notesData) {
        this.data.notes = JSON.parse(notesData);
      }
      if (eventsData) {
        this.data.events = JSON.parse(eventsData);
      }
      if (todosData) {
        this.data.todos = JSON.parse(todosData);
      }
      if (quizCardsData) {
        this.data.quizCards = JSON.parse(quizCardsData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      // Initialize with empty data if loading fails
      this.data = { users: {}, notes: [], events: [], todos: [], quizCards: {} };
    }
  }

  private saveData(): void {
    try {
      localStorage.setItem('users', JSON.stringify(this.data.users));
      localStorage.setItem('notes', JSON.stringify(this.data.notes));
      localStorage.setItem('events', JSON.stringify(this.data.events));
      localStorage.setItem('todos', JSON.stringify(this.data.todos));
      localStorage.setItem('quizCards', JSON.stringify(this.data.quizCards));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  // User methods
  public getUser(email: string): { user: User; password: string } | undefined {
    return this.data.users[email];
  }

  public saveUser(email: string, userData: { user: User; password: string }): void {
    this.data.users[email] = userData;
    this.saveData();
  }

  public getAllUsers(): { [key: string]: { user: User; password: string } } {
    return this.data.users;
  }

  public addXP = (userId: string, amount: number): { xp: number; level: number; leveledUp: boolean; streakUpdated: boolean } => {
    const userData = Object.values(this.data.users).find(u => u.user.id === userId);
    if (!userData) throw new Error('User not found');

    const currentXP = userData.user.xp;
    const currentLevel = userData.user.level;
    const newXP = currentXP + amount;
    
    // Calculate new level (1 level per 20 XP)
    const newLevel = Math.floor(newXP / 20) + 1;
    const leveledUp = newLevel > currentLevel;

    // Update streak
    const streakUpdated = this.updateStreak(userData.user);

    // Update user data
    userData.user.xp = newXP;
    userData.user.level = newLevel;
    this.saveData();

    return {
      xp: newXP,
      level: newLevel,
      leveledUp,
      streakUpdated
    };
  };

  private updateStreak(user: User): boolean {
    const today = new Date();
    const lastActivity = new Date(user.lastActivityDate);
    
    // Reset time part for date comparison
    today.setHours(0, 0, 0, 0);
    lastActivity.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Already updated today
      return false;
    } else if (diffDays === 1) {
      // Next day, increment streak
      user.currentStreak += 1;
      if (user.currentStreak > user.longestStreak) {
        user.longestStreak = user.currentStreak;
      }
    } else {
      // Streak broken
      user.currentStreak = 1;
    }
    
    user.lastActivityDate = new Date().toISOString();
    return true;
  }

  // Note methods
  public getNotes(userId: string): Note[] {
    return this.data.notes.filter(note => note.userId === userId);
  }

  public getNoteById(id: string, userId: string): Note | undefined {
    return this.data.notes.find(note => note.id === id && note.userId === userId);
  }

  public createNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Note {
    const newNote: Note = {
      ...note,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.notes.push(newNote);
    this.saveData();
    return newNote;
  }

  public updateNote(id: string, userId: string, updates: Partial<Note>): Note | undefined {
    const noteIndex = this.data.notes.findIndex(note => note.id === id && note.userId === userId);
    if (noteIndex === -1) return undefined;

    const updatedNote = {
      ...this.data.notes[noteIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.data.notes[noteIndex] = updatedNote;
    this.saveData();
    return updatedNote;
  }

  public deleteNote(id: string, userId: string): boolean {
    const initialLength = this.data.notes.length;
    this.data.notes = this.data.notes.filter(note => !(note.id === id && note.userId === userId));
    this.saveData();
    return this.data.notes.length < initialLength;
  }

  // Calendar Event methods
  public getEvents(userId: string): CalendarEvent[] {
    return this.data.events.filter(event => event.userId === userId);
  }

  public getEventById(id: string, userId: string): CalendarEvent | undefined {
    return this.data.events.find(event => event.id === id && event.userId === userId);
  }

  public getEventsByDateRange(userId: string, startDate: string, endDate: string): CalendarEvent[] {
    return this.data.events.filter(event => 
      event.userId === userId && 
      event.startTime >= startDate && 
      event.startTime <= endDate
    );
  }

  public createEvent(event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>): CalendarEvent {
    const newEvent: CalendarEvent = {
      ...event,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.events.push(newEvent);
    this.saveData();
    return newEvent;
  }

  public updateEvent(id: string, userId: string, updates: Partial<CalendarEvent>): CalendarEvent | undefined {
    const eventIndex = this.data.events.findIndex(event => event.id === id && event.userId === userId);
    if (eventIndex === -1) return undefined;

    const updatedEvent = {
      ...this.data.events[eventIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.data.events[eventIndex] = updatedEvent;
    this.saveData();
    return updatedEvent;
  }

  public deleteEvent(id: string, userId: string): boolean {
    const initialLength = this.data.events.length;
    this.data.events = this.data.events.filter(event => !(event.id === id && event.userId === userId));
    this.saveData();
    return this.data.events.length < initialLength;
  }

  // Quiz Card methods
  public getQuizCards(userId: string): QuizCard[] {
    return this.data.quizCards[userId] || [];
  }

  public saveQuizCards(userId: string, cards: QuizCard[]): void {
    this.data.quizCards[userId] = cards;
    this.saveData();
  }

  public deleteQuizCard(id: string, userId: string): boolean {
    if (!this.data.quizCards[userId]) return false;
    
    const initialLength = this.data.quizCards[userId].length;
    this.data.quizCards[userId] = this.data.quizCards[userId].filter(card => card.id !== id);
    this.saveData();
    return this.data.quizCards[userId].length < initialLength;
  }

  // Todo methods
  public getTodos(userId: string): Todo[] {
    return this.data.todos.filter(todo => todo.userId === userId);
  }

  public getTodoById(id: string, userId: string): Todo | undefined {
    return this.data.todos.find(todo => todo.id === id && todo.userId === userId);
  }

  public createTodo(todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>): Todo {
    const newTodo: Todo = {
      ...todo,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.todos.push(newTodo);
    this.saveData();
    return newTodo;
  }

  public updateTodo(id: string, userId: string, updates: Partial<Todo>): Todo | undefined {
    const todoIndex = this.data.todos.findIndex(todo => todo.id === id && todo.userId === userId);
    if (todoIndex === -1) return undefined;

    const updatedTodo = {
      ...this.data.todos[todoIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.data.todos[todoIndex] = updatedTodo;
    this.saveData();
    return updatedTodo;
  }

  public deleteTodo(id: string, userId: string): boolean {
    const initialLength = this.data.todos.length;
    this.data.todos = this.data.todos.filter(todo => !(todo.id === id && todo.userId === userId));
    this.saveData();
    return this.data.todos.length < initialLength;
  }
}

export const storageService = StorageService.getInstance(); 