import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API_URL = "https://thoughtvault-notes-app.onrender.com/notes";

function App() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  const [pinnedNotes, setPinnedNotes] = useState(() => {
    return JSON.parse(localStorage.getItem("pinnedNotes")) || [];
  });

  const [noteColors, setNoteColors] = useState(() => {
    return JSON.parse(localStorage.getItem("noteColors")) || {};
  });

  // ---------------- FETCH NOTES ----------------

  const fetchNotes = async () => {
    try {
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to fetch notes");
      }

      const data = await response.json();
      setNotes(data);
    } catch (err) {
      console.error(err);
      setError("Unable to connect to the server.");
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // ---------------- SAVE PINNED NOTES ----------------

  useEffect(() => {
    localStorage.setItem(
      "pinnedNotes",
      JSON.stringify(pinnedNotes)
    );
  }, [pinnedNotes]);

  // ---------------- SAVE COLORS ----------------

  useEffect(() => {
    localStorage.setItem(
      "noteColors",
      JSON.stringify(noteColors)
    );
  }, [noteColors]);

  // ---------------- CREATE / UPDATE ----------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      setError("Please enter both title and content.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      if (editingId) {
        const response = await fetch(`${API_URL}/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: title.trim(),
            content: content.trim(),
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update note");
        }

        const updatedNote = await response.json();

        setNotes((prevNotes) =>
          prevNotes.map((note) =>
            note._id === editingId ? updatedNote : note
          )
        );

        setEditingId(null);
      } else {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: title.trim(),
            content: content.trim(),
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to create note");
        }

        const newNote = await response.json();

        setNotes((prevNotes) => [newNote, ...prevNotes]);
      }

      setTitle("");
      setContent("");
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- EDIT ----------------

  const handleEdit = (note) => {
    setEditingId(note._id);
    setTitle(note.title);
    setContent(note.content);
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ---------------- CANCEL EDIT ----------------

  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle("");
    setContent("");
    setError("");
  };

  // ---------------- DELETE ----------------

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this note?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete note");
      }

      setNotes((prevNotes) =>
        prevNotes.filter((note) => note._id !== id)
      );

      setPinnedNotes((prev) =>
        prev.filter((noteId) => noteId !== id)
      );
    } catch (err) {
      console.error(err);
      setError("Failed to delete note.");
    }
  };

  // ---------------- PIN ----------------

  const togglePin = (id) => {
    setPinnedNotes((prev) =>
      prev.includes(id)
        ? prev.filter((noteId) => noteId !== id)
        : [...prev, id]
    );
  };

  // ---------------- COLOR ----------------

  const changeColor = (id, color) => {
    setNoteColors((prev) => ({
      ...prev,
      [id]: color,
    }));
  };

  // ---------------- SEARCH ----------------

  const filteredNotes = useMemo(() => {
    const query = search.toLowerCase().trim();

    const filtered = notes.filter(
      (note) =>
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query)
    );

    return [...filtered].sort((a, b) => {
      const aPinned = pinnedNotes.includes(a._id);
      const bPinned = pinnedNotes.includes(b._id);

      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;

      return 0;
    });
  }, [notes, search, pinnedNotes]);

  // ---------------- DATE ----------------

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={darkMode ? "app dark" : "app"}>

      {/* HEADER */}

      <header className="header">

        <div className="header-content">

          <div className="logo-area">
            <div className="logo">📝</div>

            <div>
              <h1>ThoughtVault</h1>
              <p>Your ideas. Your space. Your vault.</p>
            </div>
          </div>

          <button
            className="theme-btn"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>

        </div>

      </header>

      <main className="container">

        {/* STATS */}

        <section className="stats">

          <div className="stat-card">
            <span>📝</span>
            <div>
              <strong>{notes.length}</strong>
              <small>Total Notes</small>
            </div>
          </div>

          <div className="stat-card">
            <span>📌</span>
            <div>
              <strong>{pinnedNotes.length}</strong>
              <small>Pinned</small>
            </div>
          </div>

          <div className="stat-card">
            <span>🔎</span>
            <div>
              <strong>{filteredNotes.length}</strong>
              <small>Showing</small>
            </div>
          </div>

        </section>

        {/* FORM */}

        <section className="note-form-card">

          <div className="form-header">

            <div>
              <span className="form-label">
                {editingId ? "EDIT MODE" : "NEW NOTE"}
              </span>

              <h2>
                {editingId
                  ? "✏️ Update your thought"
                  : "✨ Capture a new thought"}
              </h2>
            </div>

            {editingId && (
              <button
                className="cancel-btn"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
            )}

          </div>

          <form onSubmit={handleSubmit}>

            <input
              type="text"
              placeholder="Give your note a title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength="100"
            />

            <div className="textarea-wrapper">

              <textarea
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows="6"
                maxLength="2000"
              />

              <span className="character-count">
                {content.length}/2000
              </span>

            </div>

            <button
              className="submit-btn"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : editingId
                ? "💾 Save Changes"
                : "✨ Save Note"}
            </button>

          </form>

          {error && (
            <div className="error">
              ⚠️ {error}
            </div>
          )}

        </section>

        {/* NOTES HEADER */}

        <section className="notes-section">

          <div className="notes-heading">

            <div>
              <span className="section-label">
                YOUR COLLECTION
              </span>

              <h2>My Notes</h2>

              <p>
                Your thoughts, ideas and important moments.
              </p>
            </div>

            <div className="search-box">
              🔎
              <input
                type="text"
                placeholder="Search notes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

          </div>

          {/* NOTES */}

          {filteredNotes.length === 0 ? (

            <div className="empty-state">

              <div className="empty-icon">
                {search ? "🔍" : "📭"}
              </div>

              <h3>
                {search
                  ? "No matching notes"
                  : "Your vault is empty"}
              </h3>

              <p>
                {search
                  ? "Try searching for another keyword."
                  : "Create your first note and start building your collection."}
              </p>

            </div>

          ) : (

            <div className="notes-grid">

              {filteredNotes.map((note) => {

                const isPinned = pinnedNotes.includes(note._id);

                const cardColor =
                  noteColors[note._id] || "default";

                return (

                  <article
                    className={`note-card ${cardColor} ${
                      isPinned ? "pinned" : ""
                    }`}
                    key={note._id}
                  >

                    {/* CARD TOP */}

                    <div className="note-top">

                      <button
                        className={`pin-btn ${
                          isPinned ? "active" : ""
                        }`}
                        onClick={() =>
                          togglePin(note._id)
                        }
                        title={
                          isPinned
                            ? "Unpin note"
                            : "Pin note"
                        }
                      >
                        {isPinned ? "📌" : "📍"}
                      </button>

                      <div className="note-actions">

                        <button
                          className="edit-btn"
                          onClick={() =>
                            handleEdit(note)
                          }
                        >
                          ✏️ Edit
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() =>
                            handleDelete(note._id)
                          }
                        >
                          🗑 Delete
                        </button>

                      </div>

                    </div>

                    {/* TITLE */}

                    <h3>{note.title}</h3>

                    {/* CONTENT */}

                    <p className="note-content">
                      {note.content}
                    </p>

                    {/* COLORS */}

                    <div className="color-picker">

                      <span>Color:</span>

                      {[
                        "default",
                        "yellow",
                        "blue",
                        "green",
                        "pink",
                      ].map((color) => (

                        <button
                          key={color}
                          className={`color-dot ${color} ${
                            cardColor === color
                              ? "selected"
                              : ""
                          }`}
                          onClick={() =>
                            changeColor(
                              note._id,
                              color
                            )
                          }
                          title={`Set ${color}`}
                        />

                      ))}

                    </div>

                    {/* FOOTER */}

                    <div className="note-date">
                      🕒{" "}
                      {note.updatedAt
                        ? `Updated ${formatDate(
                            note.updatedAt
                          )}`
                        : ""}
                    </div>

                  </article>

                );
              })}

            </div>

          )}

        </section>

      </main>

<footer className="footer">
  <div className="footer-brand">
    <span className="footer-logo">✦</span>
    <strong>NoteSpace</strong>
  </div>

  <p>
    Capture it. Organize it. Never forget it.
  </p>

  {/* <div className="footer-tech">
    <span>⚛️ React</span>
    <span>🟢 Node.js</span>
    <span>⚡ Express</span>
    <span>🍃 MongoDB</span>
  </div> */}

  <small>
    © 2026 NoteSpace · Built for your ideas
  </small>
</footer>

    </div>
  );
}

export default App;