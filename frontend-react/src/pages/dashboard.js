import { useEffect, useState } from "react";
import API from "../services/api";
import jsPDF from "jspdf";
import "../index";

export default function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [id, setId] = useState(null);
  const [status, setStatus] = useState("Pending");
  const [search, setSearch] = useState("");
  const [versions, setVersions] = useState([]);

  useEffect(() => { loadNotes(); }, []);

  const loadNotes = async () => {
    const res = await API.get("/notes");
    setNotes(res.data);
  };

  const save = async () => {
    if (id) {
      await API.put(`/notes/${id}`, { title, content, status });
    } else {
      await API.post("/notes", { title, content, status });
    }
    loadNotes();
  };

  // SEARCH
  const searchNotes = async () => {
    if (!search) {
      loadNotes();
    } else {
      const res = await API.get(`/search?q=${search}`);
      setNotes(res.data);
    }
  };

  // VERSION HISTORY
  const loadVersions = async () => {
    const res = await API.get(`/notes/${id}/versions`);
    setVersions(res.data);
  };

  const restore = async (c) => {
    await API.post(`/notes/${id}/restore`, { content: c });
    setContent(c);
  };

  const exportPDF = () => {
    const pdf = new jsPDF();
    pdf.setFontSize(16);
    pdf.text(title || "E-Learning Note", 10, 15);
    pdf.setFontSize(12);
    pdf.text(pdf.splitTextToSize(content, 180), 10, 30);
    pdf.save(`${title || "note"}.pdf`);
  };

  return (
    <div className="dashboard">

      <header className="navbar">
        <h2>E-Learning Notes</h2>

      <div className="search-box">
  <span className="search-icon">🔍</span>

  <input
    className="search-input"
    type="text"
    placeholder="Search notes by title or content..."
    value={search}
    onChange={e => setSearch(e.target.value)}
    onKeyUp={searchNotes}
  />

  {/* Clear Button */}
  {search && (
    <span
      className="clear-btn"
      onClick={() => {
        setSearch("");
        loadNotes();   // reload all notes when cleared
      }}
    >
      ✖
    </span>
  )}
</div>



        <button onClick={() => { localStorage.clear(); window.location.reload(); }}>
          Logout
        </button>
      </header>

      <div className="main">

        <aside className="sidebar">
          <button className="primary full" onClick={() => {
            setId(null); setTitle(""); setContent(""); setStatus("Pending");
          }}>
            + New Note
          </button>

          {/* STUDY PROGRESS COUNTER */}
          <div style={{ padding: "10px", fontSize: "14px" }}>
            Studied: {notes.filter(n => n.status === "Studied").length} <br />
            Pending: {notes.filter(n => n.status === "Pending").length} <br />
            Revise: {notes.filter(n => n.status === "Revise").length}
          </div>

          {notes.map(n => (
            <div key={n.id} className="note-item" onClick={() => {
              setId(n.id);
              setTitle(n.title);
              setContent(n.content);
              setStatus(n.status || "Pending");
            }}>
              {n.title || "Untitled"}
            </div>
          ))}
        </aside>

        <section className="editor">
          <input
            className="title"
            placeholder="Note title"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />

          {/* STATUS DROPDOWN */}
          <select value={status} onChange={e => setStatus(e.target.value)}>
            <option>Pending</option>
            <option>Studied</option>
            <option>Revise</option>
          </select>

          <textarea
            placeholder="Start writing your notes..."
            value={content}
            onChange={e => setContent(e.target.value)}
          />

          <div className="actions">
            <button className="primary" onClick={save}>Save</button>
            <button className="secondary" onClick={exportPDF}>Export PDF</button>
            <button onClick={loadVersions}>View History</button>
          </div>

          {/* VERSION HISTORY LIST */}
          {/* VERSION HISTORY PANEL */}
{versions.length > 0 && (
  <div className="history-panel">

    <div className="history-header">
      <h4>Version History</h4>

      {/* Delete All Versions Button */}
      <button
        className="delete-history"
        onClick={async () => {
  console.log("Deleting history for note id:", id);   // 👈 ADD THIS

  if (!id) {
    alert("Please select a note first!");
    return;
  }

  await API.delete(`/notes/${id}/versions`);
  setVersions([]);
}}

      >
        🗑 Delete Old Versions
      </button>
    </div>

    {versions.map(v => (
      <div key={v.id} className="history-card">
        <div className="history-time">
          🕒 {new Date(v.saved_at).toLocaleString()}
        </div>

        <button
          className="restore-btn"
          onClick={() => restore(v.content)}
        >
          Restore
        </button>
      </div>
    ))}

  </div>
)}

        </section>

      </div>
    </div>
  );
}
