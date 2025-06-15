import React, { useEffect, useState } from "react";
import "./HomePage.css";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const [tasks, setTasks] = useState([]);
  const [loadingChatId, setLoadingChatId] = useState(null);
  const navigate = useNavigate();

  let user = null;
  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser) user = JSON.parse(storedUser);
  } catch (err) {
    console.error("Failed to parse user from localStorage:", err);
    localStorage.removeItem("user");
  }

  useEffect(() => {
    if (!user) {
      alert("Please login first.");
      window.location.href = "/";
    }
  }, [user]);

  useEffect(() => {
    const getTasks = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/tasks");
        const data = await res.json();
        setTasks(data);
      } catch (err) {
        console.error("Failed to fetch tasks:", err);
      }
    };

    getTasks();
  }, []);

  const handleChat = async (receiverId) => {
    if (!receiverId || receiverId === user?._id) {
      alert("Cannot chat with yourself.");
      return;
    }

    try {
      setLoadingChatId(receiverId);
      const res = await fetch("http://localhost:5000/api/chat/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ receiverId }),
      });

      const data = await res.json();
      window.location.href = `/chat?conversationId=${data._id}`;
    } catch (err) {
      console.error("Error initiating chat:", err);
    } finally {
      setLoadingChatId(null);
    }
  };

  return (
    <div className="homepage" style={{ display: "flex" }}>
      {/* Sidebar Dashboard */}
      <div
        style={{
          width: "180px",
          background: "#0f172a",
          color: "white",
          padding: "1.5rem 1rem",
          minHeight: "100vh",
          boxShadow: "2px 0 6px rgba(0,0,0,0.2)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 1000,
        }}
      >
        <div>
          <h2 style={{ color: "#facc15", marginBottom: "2rem" }}>Dashboard</h2>
          <button
            className="sidebar-btn"
            onClick={() => navigate("/proposals")}
          >
            📩 Proposals
          </button>
          <button className="sidebar-btn" onClick={() => navigate("/chat")}>
            💬 Chat
          </button>
          <button
            className="sidebar-btn"
            onClick={() => navigate("/post-task")}
          >
            <Plus size={14} /> Post Task
          </button>
        </div>

        <div>
          <button className="sidebar-btn" onClick={() => navigate("/profile")}>
            👤 Profile
          </button>
          <p
            style={{ fontSize: "0.8rem", color: "#94a3b8", marginTop: "1rem" }}
          >
            © Hourvest 2025
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, marginLeft: "220px" }}>
        {/* Navbar */}
        <nav
          className="navbar"
          style={{
            justifyContent: "center",
            borderBottom: "1px solid #e2e8f0",
            padding: "1rem 0",
          }}
        >
          <h1 className="logo" style={{ textAlign: "center" }}>
            Hourvest
          </h1>
        </nav>

        {/* Hero Section */}
        <section className="banner">
          <h2>
            Welcome to <span>Hourvest</span> 🌟
          </h2>
          <p>
            Your time is valuable — earn rewards by helping others, or get
            things done fast by posting your own tasks.
          </p>
        </section>

        {/* Section Header */}
        <div className="section-header">
          <h3>🔥 Latest Tasks</h3>
          <span className="task-count">({tasks.length} tasks)</span>
        </div>

        {/* Task Feed */}
        <div className="task-feed">
          {tasks.length === 0 ? (
            <div className="empty">No tasks available yet 🚫</div>
          ) : (
            tasks.map((task) => (
              <div className="task-card" key={task._id}>
                <div className="task-media">
                  {task.media?.length > 0 && task.media[0] ? (
                    <video src={task.media[0]} controls />
                  ) : (
                    <div className="no-media">No media provided 📭</div>
                  )}
                </div>

                <div className="task-content">
                  <h3>{task.title}</h3>
                  <p>{task.description}</p>

                  <div className="task-meta">
                    <span className="tag posted">
                      👤 {task.postedBy?.username || "Anonymous"}
                    </span>
                    <span className="tag time">⏱ {task.minits} minits</span>
                    <span className="tag field">
                      📂 {task.keywords?.field || "General"}
                    </span>
                    <span className="tag urgency">
                      🔥 {task.keywords?.urgency || "Normal"}
                    </span>

                    <button
                      className="msg-btn"
                      onClick={() => handleChat(task.postedBy._id)}
                      disabled={loadingChatId === task.postedBy._id}
                    >
                      {loadingChatId === task.postedBy._id
                        ? "⏳ Opening..."
                        : "💬 Chat"}
                    </button>

                    <button
                      className="msg-btn"
                      onClick={() =>
                        (window.location.href = `/propose-form/${task.postedBy._id}`)
                      }
                    >
                      ✍️ Propose
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
