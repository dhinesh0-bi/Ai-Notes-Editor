import React from 'react';

function NoteList({ notes, selectedNoteId, onSelectNote, onAddNote }) {
  return (
    <div className="note-list-container">
      <button className="new-note-btn" onClick={onAddNote}>
        + New Note
      </button>
      <div className="note-list">
        {notes.length === 0 && (
          <div className="note-list-item">No notes found.</div>
        )}
        {notes.map(note => (
          <div
            key={note.id}
            className={`note-list-item ${note.id === selectedNoteId ? 'selected' : ''}`}
            onClick={() => onSelectNote(note.id)}
          >
            <h3>{note.title || "Untitled"}</h3>
            <p>{note.content.substring(0, 30)}...</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NoteList;