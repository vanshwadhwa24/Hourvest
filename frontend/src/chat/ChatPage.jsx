import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import socket from "./socket";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";
import "../styles/chat.css";

const ChatPage = ({ user }) => {
  const [currentChat, setCurrentChat] = useState(null);
  const location = useLocation();

  useEffect(() => {
    if (user?._id) {
      socket.emit("addUser", user._id);
    }

    const queryParams = new URLSearchParams(location.search);
    const conversationId = queryParams.get("conversationId");

    if (conversationId) {
      setCurrentChat({ _id: conversationId }); // Enough to pass it to ChatWindow
    }
  }, [user, location]);

  return (
    <div className="chat-page">
      <ChatList user={user} setCurrentChat={setCurrentChat} currentChat={currentChat} />
      <ChatWindow user={user} currentChat={currentChat} />
    </div>
  );
};

export default ChatPage;