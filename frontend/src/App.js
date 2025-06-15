import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./login";
import Signup from "./signup";
import Profile from "./profile";
import PostTask from "./postTask";
import OAuthSuccess from "./OAuthSuccess";
import ChatPage from "./chat/ChatPage";
import Home from "./home";
import AIChatPage from "./aichat";
import Proposals from "./Proposals";
import ProposeForm from "./ProposeForm";


function App() {
  let user = null;

  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      user = JSON.parse(storedUser);
    }
  } catch (error) {
    console.error("Error parsing user from localStorage:", error);
    localStorage.removeItem("user"); // clean up if it's corrupted
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/post-task" element={<PostTask />} />
        <Route path="/oauth-success" element={<OAuthSuccess />} />
        <Route path="/chat" element={<ChatPage user={user} />} />
        <Route path="/home" element={<Home />} />
        <Route path="/aichat" element={<AIChatPage user={user} />} />
        <Route path="/proposals" element={<Proposals/>} />
        <Route path="/propose-form/:receiverId" element={<ProposeForm />} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;
