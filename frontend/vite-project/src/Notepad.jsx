import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import './Notepad.css';

const PlusIcon = React.memo(() => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
));

const DownloadIcon = React.memo(() => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
));

const PrintIcon = React.memo(() => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6 9 6 2 18 2 18 9"/>
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
    <rect x="6" y="14" width="12" height="8"/>
  </svg>
));

const TextIcon = React.memo(() => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="4" y1="6" x2="20" y2="6"/>
    <line x1="4" y1="12" x2="14" y2="12"/>
    <line x1="4" y1="18" x2="18" y2="18"/>
  </svg>
));

const ImageIcon = React.memo(() => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
));

const UploadIcon = React.memo(() => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
));

const TrashIcon = React.memo(() => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/>
    <path d="M14 11v6"/>
  </svg>
));

const Notepad = () => {
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTextMode, setIsTextMode] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Sample meeting info
  const meetingInfo = useMemo(() => ({
    id: 'MTG-2024-001',
    date: new Date().toLocaleDateString('en-US', { 
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    }),
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }), []);

  useEffect(() => {
    const savedNotes = localStorage.getItem('meeting-notes');
    if (savedNotes) {
      const parsedNotes = JSON.parse(savedNotes);
      setNotes(parsedNotes);
      if (parsedNotes.length > 0) {
        setActiveNote(parsedNotes[0]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('meeting-notes', JSON.stringify(notes));
  }, [notes]);

  const createNote = useCallback((type = 'text') => {
    const newNote = {
      id: Date.now(),
      title: '',
      content: '',
      type: type,
      image: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setNotes(prev => [newNote, ...prev]);
    setActiveNote(newNote);
    setIsTextMode(type === 'text');
  }, []);

  const updateNote = useCallback((noteId, updates) => {
    setNotes(prev => prev.map(note => 
      note.id === noteId 
        ? { ...note, ...updates, updatedAt: new Date().toISOString() }
        : note
    ));
    if (activeNote && activeNote.id === noteId) {
      setActiveNote({ ...activeNote, ...updates });
    }
  }, [activeNote]);

  const deleteNote = useCallback((noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      setNotes(prev => prev.filter(note => note.id !== noteId));
      if (activeNote && activeNote.id === noteId) {
        setActiveNote(notes.length > 1 ? notes.find(n => n.id !== noteId) : null);
      }
    }
  }, [activeNote, notes]);

  const handleFileUpload = useCallback((file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (activeNote) {
          updateNote(activeNote.id, { 
            image: e.target.result,
            type: 'image'
          });
        } else {
          const newNote = {
            id: Date.now(),
            title: `Image - ${file.name}`,
            content: '',
            type: 'image',
            image: e.target.result,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          setNotes(prev => [newNote, ...prev]);
          setActiveNote(newNote);
        }
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please select an image file');
    }
  }, [activeNote, updateNote]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  const filteredNotes = useMemo(() => notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  ), [notes, searchQuery]);

  const exportNotes = useCallback(() => {
    const notesData = {
      meetingInfo,
      notes: notes,
      exportDate: new Date().toISOString()
    };
    const dataStr = JSON.stringify(notesData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `meeting-notes-${meetingInfo.id}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [meetingInfo, notes]);

  const printNotes = useCallback(() => {
    window.print();
  }, []);

  const formatTime = useCallback((dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }, []);

  return (
    <div className="notepad-container">
        <br /><br /><br />
      <div className="notepad-wrapper fade-in">
        {/* Header */}
        <div className="notepad-header">
          <div className="header-left">
            <div>
              <h1 className="notepad-title">Meeting Notes</h1>
              <div className="meeting-info">
                <div className="meeting-id">Meeting ID: {meetingInfo.id}</div>
                <div className="meeting-date">{meetingInfo.date} at {meetingInfo.time}</div>
              </div>
            </div>
          </div>
          <div className="header-actions">
            <button onClick={exportNotes} className="header-btn">
              <DownloadIcon />
              Export
            </button>
            <button onClick={printNotes} className="header-btn">
              <PrintIcon />
              Print
            </button>
          </div>
        </div>
        {/* Main Content */}
        <div className="notepad-content">
          {/* Sidebar */}
          <div className="notes-sidebar">
            <div className="sidebar-header">
              <h2 className="sidebar-title">Notes ({notes.length})</h2>
              <button 
                onClick={() => createNote('text')} 
                className="add-note-btn"
              >
                <PlusIcon />
                Add Note
              </button>
            </div>
            <div className="search-container">
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="notes-list">
              {filteredNotes.map(note => (
                <div
                  key={note.id}
                  className={`note-item fade-in ${activeNote?.id === note.id ? 'active' : ''}`}
                  onClick={() => setActiveNote(note)}
                >
                  <div className="note-preview">
                    {note.title || 'Untitled Note'}
                  </div>
                  <div className="note-meta">
                    <span className={`note-type ${note.type}`}>{note.type === 'image' ? 'Image' : 'Text'}</span>
                    <span>{formatTime(note.updatedAt)}</span>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); deleteNote(note.id); }}
                    className="delete-note-btn"
                  >×</button>
                </div>
              ))}
              {filteredNotes.length === 0 && searchQuery && (
                <div className="empty-state fade-in">
                  <div className="empty-icon">🔍</div>
                  <div className="empty-title">No notes found</div>
                  <div className="empty-description">Try adjusting your search terms</div>
                </div>
              )}
            </div>
          </div>
          {/* Editor Area */}
          <div className="editor-area fade-in">
            {activeNote ? (
              <>
                {/* Toolbar */}
                <div className="editor-toolbar">
                  <button
                    onClick={() => setIsTextMode(true)}
                    className={`toolbar-btn ${isTextMode ? 'active' : ''}`}
                  >
                    <TextIcon />
                    Text
                  </button>
                  <button
                    onClick={() => setIsTextMode(false)}
                    className={`toolbar-btn ${!isTextMode ? 'active' : ''}`}
                  >
                    <ImageIcon />
                    Image
                  </button>
                  <div className="toolbar-divider"></div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="toolbar-btn"
                  >
                    <UploadIcon />
                    Upload
                  </button>
                  <button
                    onClick={() => updateNote(activeNote.id, { title: '', content: '', image: null })}
                    className="toolbar-btn"
                  >
                    <TrashIcon />
                    Clear
                  </button>
                  <div className="toolbar-divider"></div>
                  <button
                    onClick={() => createNote('text')}
                    className="toolbar-btn"
                  >
                    <PlusIcon />
                    New Note
                  </button>
                </div>
                {/* Editor Content */}
                <div className="editor-content fade-in">
                  <input
                    type="text"
                    placeholder="Enter note title..."
                    value={activeNote.title}
                    onChange={e => updateNote(activeNote.id, { title: e.target.value })}
                    className="note-title-input"
                  />
                  {isTextMode ? (
                    <textarea
                      placeholder="Start typing your notes here..."
                      value={activeNote.content || ''}
                      onChange={e => updateNote(activeNote.id, { content: e.target.value })}
                      className="note-editor"
                    />
                  ) : (
                    <div
                      className={`image-upload-area ${dragOver ? 'dragover' : ''}`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {activeNote.image ? (
                        <div className="image-preview">
                          <img 
                            src={activeNote.image} 
                            alt="Note" 
                            className="preview-image"
                          />
                          <div className="image-actions">
                            <button
                              onClick={e => { e.stopPropagation(); updateNote(activeNote.id, { image: null }); }}
                              className="image-action-btn"
                            >Remove Image</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="upload-icon">📁</div>
                          <div className="upload-text">Click to upload or drag and drop</div>
                          <div className="upload-hint">PNG, JPG, GIF up to 10MB</div>
                        </>
                      )}
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={e => handleFileUpload(e.target.files[0])}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                </div>
              </>
            ) : (
              <div className="empty-state fade-in">
                <div className="empty-icon">📝</div>
                <div className="empty-title">No note selected</div>
                <div className="empty-description">Select a note from the sidebar or create a new one to get started</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notepad;
