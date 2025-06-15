require("dotenv").config();
const connectDB = require("./config/db");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const session = require("express-session");
const passport = require("passport");
require("./passport"); // load passport strategy

const app = express();
const server = http.createServer(app); // use this to create the HTTP server

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
  },
});

// Allow cross-origin requests
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());

// Connect to MongoDB
connectDB()
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });

app.use(
  session({
    secret: "super-secret-session", // just needed for passport session
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Step 1: Redirect to Google for login
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Step 2: Handle callback from Google
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: 'http://localhost:3000/signup' }),
  (req, res) => {
    console.log("✅ Google user:", req.user);  // TEMP DEBUG LOG
    const token = req.user?.token;

    if (token) {
      res.redirect(`http://localhost:3000/oauth-success?token=${token}`);
    } else {
      res.redirect('http://localhost:3000');
    }
  }
);


// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/tasks", require("./routes/tasks"));
app.use("/api/chat", require("./routes/chat"));
app.use("/api/userRoutes", require("./routes/userRoutes"));

app.get("/debug-task-route", (req, res) => {
  res.send("Task route is working");
});

console.log("✅ Task, Auth, and Chat routes mounted");

// SOCKET.IO
let users = [];

const addUser = (userId, socketId) => {
  if (!users.find((u) => u.userId === userId)) {
    users.push({ userId, socketId });
  }
};

const removeUser = (socketId) => {
  users = users.filter((u) => u.socketId !== socketId);
};

const getUser = (userId) => users.find((u) => u.userId === userId);

io.on("connection", (socket) => {
  console.log("🔌 A user connected");

  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users);
    console.log(`✅ User ${userId} connected`);
  });

  socket.on("joinRoom", (conversationId) => {
    socket.join(conversationId);
    console.log(`🟢 User joined room ${conversationId}`);
  });

  socket.on("sendMessage", ({ sender, conversationId, text }) => {
    // Send to all in room (except sender)
    socket
      .to(conversationId)
      .emit("newMessage", { sender, conversationId, text });

    // Optionally send to sender too for confirmation
    socket.emit("newMessage", { sender, conversationId, text });
  });

  socket.on("disconnect", () => {
    removeUser(socket.id);
    io.emit("getUsers", users);
    console.log("❌ A user disconnected");
  });
});

const proposalRoutes = require("./routes/proposalRoutes");
app.use("/api/proposals", proposalRoutes);

// ✅ Only this should be used to start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Server + Socket.IO running on port ${PORT}`)
);
