const Chat = require("../models/chatModel");
const User = require("../models/userModel");

// CREATE OR ACCSESS CHAT (/chat)
exports.accessChat = async (req, res, next) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("User Id param not sent with request!");
    res.sendStatus(400);
  }

  let isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    let chatData = new Chat({
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    });

    try {
      const createdChat = await chatData.save();

      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );

      res.status(200).send(FullChat);
    } catch (error) {
      next(error);
    }
  }
};

// GET ALL CHATS (/chat)
exports.fetchChats = async (req, res, next) => {
  try {
    let results = await Chat.find({
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    results = await User.populate(results, {
      path: "latestMessage.sender",
      select: "name pic email",
    });

    res.status(200).send(results);
  } catch (error) {
    next(error);
  }
};

// CREATE GROUP CHAT (/chat/group)
exports.createGroupChat = async (req, res, next) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).json({ message: "Please fill all the fields!" });
  }

  let users = JSON.parse(req.body.users);

  if (users.length < 2) {
    return res.status(400).json({
      message: "More than 2 users are required to form a group chat!",
    });
  }

  users.push(req.user);

  const groupChat = new Chat({
    chatName: req.body.name,
    users: users,
    isGroupChat: true,
    groupAdmin: req.user,
  });

  try {
    const group = await groupChat.save();

    const fullGroupChat = await Chat.findOne({ _id: group._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (error) {
    next(error);
  }
};

// RENAME GROUP CHAT (/chat/rename)
exports.renameGroup = async (req, res, next) => {
  const { chatId, chatName } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    { chatName },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) {
    res.status(404).json({ message: "Not Found!" });
  } else {
    res.json(updatedChat);
  }
};

// ADD USER TO GROUP (/chat/groupadd)
exports.addToGroup = async (req, res, next) => {
  const { chatId, userId } = req.body; // group id and user id

  const added = await Chat.findByIdAndUpdate(
    chatId,
    { $push: { users: userId } },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!added) {
    res.status(404).json({ message: "Not Found!" });
  } else {
    res.json(added);
  }
};

// REMOVE USER FROM CHAT (/chat/groupremove)
exports.removeFromGroup = async (req, res, next) => {
  const { chatId, userId } = req.body; // group id and user id

  const removed = await Chat.findByIdAndUpdate(
    chatId,
    { $pull: { users: userId } },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!removed) {
    res.status(404).json({ message: "Not Found!" });
  } else {
    res.json(removed);
  }
};
