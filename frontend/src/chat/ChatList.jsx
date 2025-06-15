import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ChatList = ({ user, setCurrentChat, currentChat }) => {
  const [conversations, setConversations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConversations = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Session expired. Please log in again.");
        window.location.href = "/";
        return;
      }

      try {
        const res = await axios.get(
          "http://localhost:5000/api/chat/conversations",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );
        setConversations(res.data);
      } catch (err) {
        console.error("❌ Error fetching conversations:", err);
        alert("Unauthorized. Please log in again.");
        localStorage.removeItem("token");
        window.location.href = "/";
      }
    };

    fetchConversations();
  }, []);

  return (
    <div
      className="chat-list"
      style={{
        width: "260px",
        background: "#0f172a",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        borderRight: "1px solid #1e293b",
      }}
    >
      {/* Fixed Header */}
      <div style={{ padding: "1rem", borderBottom: "1px solid #1e293b" }}>
        <button
          onClick={() => navigate("/home")}
          style={{
            background: "#1e293b",
            border: "none",
            color: "#facc15",
            padding: "0.7rem 1rem",
            width: "100%",
            fontSize: "1rem",
            borderRadius: "0.5rem",
            cursor: "pointer",
          }}
        >
          🏠 Home
        </button>
        <h3 style={{ marginTop: "1rem", fontSize: "1.2rem" }}>Your Chats</h3>
      </div>

      {/* Scrollable Conversations */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "1rem",
        }}
      >
        {conversations.map((conv) => {
          const friend = conv.members.find((m) => m._id !== user._id);
          const isActive = currentChat && conv._id === currentChat._id;

          return (
            <div
              key={conv._id}
              className="chat-list-item"
              onClick={() => setCurrentChat(conv)}
              style={{
                padding: "0.75rem 1rem",
                marginBottom: "0.5rem",
                borderRadius: "0.5rem",
                background: isActive ? "#facc15" : "#1e293b",
                color: isActive ? "#0f172a" : "#fff",
                cursor: "pointer",
                fontWeight: isActive ? "bold" : "normal",
              }}
            >
              <p>{friend?.username || "Unknown"}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChatList;
