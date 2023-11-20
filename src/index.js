const express = require("express");
const app = express();
const cors = require("cors");
const connectDB = require("./config/db");
const bodyParser = require("body-parser");

// config
require("dotenv").config();
connectDB();
const port = process.env.PORT || 3000;

// import routes
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const notifRoutes = require("./routes/notifRoutes");

// middleware
// app.use(cors({ origin: "http://localhost:5173" })); // prod
app.use(cors()); // dev
app.use(bodyParser.json());

// main route
app.get("/", (req, res) => {
  res.send("Pybro API");
});

// group
app.use("/user", userRoutes);
app.use("/chat", chatRoutes);
app.use("/message", messageRoutes);
app.use("/notif", notifRoutes);

// global err
app.use((error, req, res) => {
  const status = error.errorStatus || 500;
  const message = error.message;
  res.status(status).json({ message: message });
});

// server listen
const server = app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

const io = require("socket.io")(server, {
  pingTimeout: 30000,
  cors: {
    origin: "http://localhost:5173",
  },
});

io.on("connection", (socket) => {
  // console.log("socket has been connecting");
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    // console.log("User joined room: " + room);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageReceived) => {
    let chat = newMessageReceived.chat;

    if (!chat.users) return console.log("chat.users is not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageReceived.sender._id) return;

      socket.in(user._id).emit("message received", newMessageReceived);
    });
  });

  socket.off("setup", () => {
    socket.leave(userData._id);
  });
});
