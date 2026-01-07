import { useEffect, useState } from "react";
import API from "../services/api";
import jsPDF from "jspdf";
import "../index";

export default function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [id, setId] = useState(null);

  useEffect(() => { loadNotes(); }, []);

  const loadNotes = async () => {
    const res = await API.get("/notes");
    setNotes(res.data);
  };

  const save = async () => {
    if (id) {
      await API.put(`/notes/${id}`, { title, content });
    } else {
      await API.post("/notes", { title, content });
    }
    loadNotes();
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
        <button onClick={() => { localStorage.clear(); window.location.reload(); }}>
          Logout
        </button>
      </header>

      <div className="main">

        <aside className="sidebar">
          <button className="primary full" onClick={() => {
            setId(null); setTitle(""); setContent("");
          }}>
            + New Note
          </button>

          {notes.map(n => (
            <div key={n.id} className="note-item" onClick={() => {
              setId(n.id);
              setTitle(n.title);
              setContent(n.content);
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
          <textarea
            placeholder="Start writing your notes..."
            value={content}
            onChange={e => setContent(e.target.value)}
          />

          <div className="actions">
            <button className="primary" onClick={save}>Save</button>
            <button className="secondary" onClick={exportPDF}>Export PDF</button>
          </div>
        </section>

      </div>
    </div>
  );
}
