import { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { storageService } from '../lib/StorageService';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

const Notes = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      const userNotes = storageService.getNotes(user.id);
      setNotes(userNotes);
    }
  }, [user]);

  const handleCreateNote = () => {
    if (!user) return;

    const newNote = storageService.createNote({
      title,
      content,
      userId: user.id,
    });

    setNotes([newNote, ...notes]);
    setTitle('');
    setContent('');
    setIsEditing(false);
  };

  const handleUpdateNote = () => {
    if (!user || !selectedNote) return;

    const updatedNote = storageService.updateNote(selectedNote.id, user.id, {
      title,
      content,
    });

    if (updatedNote) {
      setNotes(notes.map(note => 
        note.id === selectedNote.id ? updatedNote : note
      ));
      setSelectedNote(updatedNote);
      setTitle('');
      setContent('');
      setIsEditing(false);
    }
  };

  const handleDeleteNote = (noteId: string) => {
    if (!user) return;

    if (storageService.deleteNote(noteId, user.id)) {
      setNotes(notes.filter(note => note.id !== noteId));
      if (selectedNote?.id === noteId) {
        setSelectedNote(null);
        setTitle('');
        setContent('');
        setIsEditing(false);
      }
    }
  };

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setSelectedNote(null);
    setTitle('');
    setContent('');
    setIsEditing(false);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Notes List */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold mb-4">My Notes</h2>
            <button
              onClick={() => setIsEditing(true)}
              className="w-full bg-indigo-500 text-white py-2 px-4 rounded-md hover:bg-indigo-600 transition-colors mb-4"
            >
              New Note
            </button>
            <div className="space-y-2">
              {notes.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No notes yet</p>
              ) : (
                notes.map(note => (
                  <div
                    key={note.id}
                    className={`p-3 rounded-md cursor-pointer ${
                      selectedNote?.id === note.id
                        ? 'bg-indigo-100'
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => handleSelectNote(note)}
                  >
                    <h3 className="font-medium">{note.title}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Note Editor */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow p-4">
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Note title"
                  className="w-full text-xl font-semibold mb-4 p-2 border-b focus:outline-none focus:border-indigo-500"
                />
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your note here..."
                  className="w-full h-64 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={selectedNote ? handleUpdateNote : handleCreateNote}
                    className="bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600 transition-colors"
                  >
                    {selectedNote ? 'Update' : 'Create'}
                  </button>
                </div>
              </>
            ) : selectedNote ? (
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold">{selectedNote.title}</h2>
                  <button
                    onClick={() => handleDeleteNote(selectedNote.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    Delete
                  </button>
                </div>
                <p className="whitespace-pre-wrap">{selectedNote.content}</p>
                <p className="text-sm text-gray-500 mt-4">
                  Last updated: {new Date(selectedNote.updatedAt).toLocaleString()}
                </p>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                Select a note or create a new one
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notes; 