// src/chat/ChatWindow.jsx
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import socket from "./socket";
import MessageBubble from "./MessageBubble";

const ChatWindow = ({ currentChat, user }) => {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentChat) return;

      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login again");
        window.location.href = "/";
        return;
      }

      try {
        const res = await axios.get(
          `http://localhost:5000/api/chat/messages/${currentChat._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );
        setMessages(res.data);
        socket.emit("joinRoom", currentChat._id);
      } catch (err) {
        console.error("❌ Error fetching messages:", err);
      }
    };

    fetchMessages();
  }, [currentChat]);

  useEffect(() => {
    const handleIncoming = (msg) => {
      if (msg.conversationId === currentChat?._id) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on("newMessage", handleIncoming);
    return () => socket.off("newMessage", handleIncoming);
  }, [currentChat]);

  const handleSend = async () => {
    if (newMsg.trim() === "") return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login again");
      window.location.href = "/";
      return;
    }

    const payload = {
      conversationId: currentChat._id,
      text: newMsg,
    };

    try {
      await axios.post("http://localhost:5000/api/chat/messages", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      socket.emit("sendMessage", {
        sender: user._id,
        conversationId: currentChat._id,
        text: newMsg,
      });

      setNewMsg("");
    } catch (err) {
      console.error("❌ Error sending message:", err);
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!currentChat) {
    return (
      <div style={{ padding: "1rem" }}>Select a chat to start messaging.</div>
    );
  }

  return (
    <div className="chat-window">
  {/* Star layers */}
  <div className="stars"></div>
  <div className="stars2"></div>
  <div className="stars3"></div>

  {/* Main chat content */}
  <div className="message-area">
    {messages.map((msg, i) => (
      <MessageBubble
        key={i}
        message={msg}
        isMine={
          (typeof msg.sender === "object" ? msg.sender._id : msg.sender) ===
          user._id
        }
      />
    ))}
    <div ref={bottomRef} />
  </div>

  <div className="send-box">
    <input
      value={newMsg}
      onChange={(e) => setNewMsg(e.target.value)}
      placeholder="Type a message"
    />
    <button onClick={handleSend}>Send</button>
  </div>
</div>

  );
};

export default ChatWindow;