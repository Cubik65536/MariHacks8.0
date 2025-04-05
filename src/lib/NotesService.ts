import { useAuth } from './AuthContext';

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

// This is a simple in-memory storage for demo purposes
// In a real app, you would use a database or API
let notes: Note[] = [];

export const useNotes = () => {
  const { user } = useAuth();

  const getNotes = (): Note[] => {
    if (!user) return [];
    return notes.filter(note => note.userId === user.id);
  };

  const getNoteById = (id: string): Note | undefined => {
    if (!user) return undefined;
    return notes.find(note => note.id === id && note.userId === user.id);
  };

  const createNote = (title: string, content: string): Note => {
    if (!user) throw new Error('User must be authenticated to create notes');
    
    const now = new Date().toISOString();
    const newNote: Note = {
      id: Date.now().toString(),
      title,
      content,
      createdAt: now,
      updatedAt: now,
      userId: user.id
    };
    
    notes.push(newNote);
    return newNote;
  };

  const updateNote = (id: string, title: string, content: string): Note => {
    if (!user) throw new Error('User must be authenticated to update notes');
    
    const noteIndex = notes.findIndex(note => note.id === id && note.userId === user.id);
    if (noteIndex === -1) throw new Error('Note not found');
    
    const updatedNote: Note = {
      ...notes[noteIndex],
      title,
      content,
      updatedAt: new Date().toISOString()
    };
    
    notes[noteIndex] = updatedNote;
    return updatedNote;
  };

  const deleteNote = (id: string): void => {
    if (!user) throw new Error('User must be authenticated to delete notes');
    
    const noteIndex = notes.findIndex(note => note.id === id && note.userId === user.id);
    if (noteIndex === -1) throw new Error('Note not found');
    
    notes.splice(noteIndex, 1);
  };

  return {
    getNotes,
    getNoteById,
    createNote,
    updateNote,
    deleteNote
  };
}; 