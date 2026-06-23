import { useState, useEffect } from 'react'
import './App.css'

// API URL comes from environment variable
// Set as VITE_API_URL in Amplify environment variables
const API_URL = import.meta.env.VITE_API_URL

function App() {
  const [notes, setNotes]       = useState([])
  const [title, setTitle]       = useState('')
  const [content, setContent]   = useState('')
  const [loading, setLoading]   = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]       = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  // Fetch all notes when component mounts
  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`${API_URL}/notes`)
      if (!res.ok) throw new Error('Failed to fetch notes')
      const data = await res.json()
      setNotes(data)
    } catch (err) {
      setError('Could not load notes. Check your API URL.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const addNote = async (e) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    try {
      setSubmitting(true)
      setError(null)
      const res = await fetch(`${API_URL}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim()
        })
      })
      if (!res.ok) throw new Error('Failed to create note')
      const newNote = await res.json()
      setNotes([newNote, ...notes])   // add new note to top of list
      setTitle('')
      setContent('')
    } catch (err) {
      setError('Could not add note. Try again.')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const deleteNote = async (id) => {
    try {
      setDeletingId(id)
      setError(null)
      const res = await fetch(`${API_URL}/notes/${id}`, {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error('Failed to delete note')
      setNotes(notes.filter(note => note.id !== id))
    } catch (err) {
      setError('Could not delete note. Try again.')
      console.error(err)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="app">

      {/* Header */}
      <header className="header">
        <h1>📝 Notes App</h1>
        <p className="subtitle">AWS Amplify · API Gateway · Lambda · DynamoDB</p>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* Add Note Form */}
      <form className="note-form" onSubmit={addNote}>
        <h2>Add Note</h2>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          disabled={submitting}
          maxLength={100}
        />
        <textarea
          placeholder="Write your note here..."
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={4}
          disabled={submitting}
          maxLength={1000}
        />
        <button
          type="submit"
          disabled={submitting || !title.trim() || !content.trim()}
        >
          {submitting ? 'Saving...' : '+ Add Note'}
        </button>
      </form>

      {/* Notes List */}
      <div className="notes-section">
        <h2>
          My Notes
          {!loading && <span className="note-count">{notes.length}</span>}
        </h2>

        {loading ? (
          <div className="state-message">Loading notes...</div>
        ) : notes.length === 0 ? (
          <div className="state-message">No notes yet. Add your first one above!</div>
        ) : (
          <div className="notes-grid">
            {notes.map(note => (
              <div key={note.id} className="note-card">
                <div className="note-header">
                  <h3>{note.title}</h3>
                  <button
                    className="delete-btn"
                    onClick={() => deleteNote(note.id)}
                    disabled={deletingId === note.id}
                    title="Delete note"
                  >
                    {deletingId === note.id ? '...' : '🗑️'}
                  </button>
                </div>
                <p className="note-content">{note.content}</p>
                <span className="note-date">
                  {new Date(note.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

export default App
