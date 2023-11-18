const mongoose = require("mongoose");

const notifModel = mongoose.Schema(
  {
    userId: { type: String, required: true },
    chats: [
      {
        chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
        sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
  },
  { timestamps: true }
);

const Notif = mongoose.model("Notif", notifModel);

module.exports = Notif;
