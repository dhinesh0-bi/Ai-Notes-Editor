import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { generateTitle } from '../services/openaiService';
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;
if (recognition) {
  recognition.continuous = true; 
  recognition.interimResults = true;
  recognition.lang = 'en-US';
}

function NoteEditor({ note, onSave, onDelete }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const textAreaRef = useRef(null);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setTags(note.tags.join(', '));
    } else {
      setTitle('');
      setContent('');
      setTags('');
    }
  }, [note]);
  const handleSave = () => {
    if (!note) return;
    const tagArray = tags.split(',').map(t => t.trim()).filter(t => t.length > 0);
    
    onSave({
      ...note, 
      title,
      content,
      tags: tagArray
    });
  };

  const handleDelete = () => {
    if (note && window.confirm("Are you sure you want to delete this note?")) {
      onDelete(note.id);
    }
  };

  const handleGenerateTitle = async () => {
    console.log("Generate Title button clicked!");

    if (!content) {
      alert("Please write some content before generating a title.");
      return;
    }
    setIsLoadingAI(true); 
    try {
      const newTitle = await generateTitle(content);
      setTitle(newTitle); 
    } catch (error) {
    
      console.error("Error from generateTitle:", error);
      alert("AI Title Generator failed. Check the console (F12) for details.");
    } finally {
      console.log("Resetting button state.");
      setIsLoadingAI(false); 
    }
  };

recognition.onend = () => {
    setIsListening(false); 
};

const toggleListen = () => {
    if (isListening) {
        recognition.stop();
    } else {
        recognition.start();
        setIsListening(true);
    }
};
  useEffect(() => {
    if (!recognition) return;
      recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript) {
          setContent(prevContent => prevContent + ' ' + finalTranscript);
      }
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };

    return () => {
        recognition.stop();
    };
  }, []);


  if (!note) {
    return <div className="note-editor-layout">Select a note or create a new one.</div>;
  }

  return (
    <div className="note-editor-layout">
      
      <div className="note-editor">
        <div className="editor-header">
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note Title"
          />
          <button 
            onClick={handleGenerateTitle} 
            disabled={isLoadingAI || !content}
            title="Generate title from content"
          >
            {isLoadingAI ? '🧠...' : 'Generate Title'}
          </button>
        </div>
        
        <div className="textarea-wrapper">
          <textarea 
            ref={textAreaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing... (Markdown is supported!)"
          />
          {recognition && (
            <button 
              className={`record-btn ${isListening ? 'listening' : ''}`}
              onClick={toggleListen}
              title={isListening ? 'Stop recording' : 'Start recording'}
            >
              🎤
            </button>
          )}
        </div>

        <input 
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Tags (comma, separated)"
          className="tags-input"
        />
        
        <div className="editor-actions">
          <button onClick={handleSave} className="save-btn">Save</button>
          <button onClick={handleDelete} className="delete-btn">Delete</button>
        </div>
      </div>

      <div className="note-preview">
        <h1>{title || "Untitled"}</h1>
        <div className="tags">
          {tags.split(',').map(t => t.trim() && <span key={t} className="tag">{t}</span>)}
        </div>
        <div className="my-markdown-styles">
         <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
      
    </div>
  );
}

export default NoteEditor;