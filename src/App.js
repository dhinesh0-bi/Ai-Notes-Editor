import React, { useState } from 'react';
import NoteList from './components/NoteList';
import NoteEditor from './components/NoteEditor';
import SearchBar from './components/Searchbar';
import './App.css';




function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
}


function App() {
  // --- State ---
  // All notes, synced with localStorage
  const [notes, setNotes] = useLocalStorage('ai-notes-app-data', [
    { id: Date.now(), title: "Welcome!", content: "# Hello!\n\nThis is your first note. It supports **Markdown**!\n\n* Try the `Generate Title` button.\n* Try the `🎤` button for speech-to-text.", tags: ["welcome", "guide"] }
  ]);
  
  // ID of the currently active note
  const [selectedNoteId, setSelectedNoteId] = useState(notes.length > 0 ? notes[0].id : null);
  
  // Search query
  const [searchTerm, setSearchTerm] = useState('');

  // --- Derived State ---
  // Find the full note object for the editor
  const selectedNote = notes.find(note => note.id === selectedNoteId);

  // Filter notes based on search term
  const filteredNotes = notes.filter(note => {
    const lowerSearch = searchTerm.toLowerCase();
    return (
      note.title.toLowerCase().includes(lowerSearch) ||
      note.content.toLowerCase().includes(lowerSearch) ||
      note.tags.some(tag => tag.toLowerCase().includes(lowerSearch))
    );
  });

  // --- CRUD Functions ---
  const addNote = () => {
    const newNote = {
      id: Date.now(),
      title: "New Note",
      content: "",
      tags: []
    };
    setNotes([newNote, ...notes]);
    setSelectedNoteId(newNote.id);
  };

  const updateNote = (updatedNote) => {
    setNotes(notes.map(note => 
      note.id === updatedNote.id ? updatedNote : note
    ));
  };

  const deleteNote = (noteId) => {
    const newNotes = notes.filter(note => note.id !== noteId);
    setNotes(newNotes);
    
    if (selectedNoteId === noteId) {
        setSelectedNoteId(newNotes.length > 0 ? newNotes[0].id : null);
    }
  };

  return (
    <div className="app-container">
      {/* --- Sidebar --- */}
      <div className="sidebar">
        <SearchBar 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
        <NoteList 
          notes={filteredNotes} // Pass filtered notes
          selectedNoteId={selectedNoteId}
          onSelectNote={setSelectedNoteId}
          onAddNote={addNote}
        />
      </div>
      <NoteEditor 
        note={selectedNote}
        onSave={updateNote}
        onDelete={deleteNote}
      />
    </div>
  );
}

export default App;