const Notif = require("../models/notifModel");

// CREATE AND ADD NOTIFICATION (/notif)
exports.sendNotif = async (req, res, next) => {
  const { userId, chatId, sender } = req.body;

  if (!userId || !chatId) {
    return res.status(400).json({ message: "Bad request!" });
  }

  const isExist = await Notif.findOne({ userId });

  if (!isExist) {
    const notifData = new Notif({
      userId: userId,
      chats: [{ chatId: chatId, sender: sender }],
    });

    const result = await notifData.save();

    let fullNotif = await Notif.findOne({ _id: result._id })
      .populate("chats.chatId", "chatName isGroupChat")
      .populate("chats.sender", "-password");

    res.json(fullNotif);
  } else {
    if (isExist.chats.find((chat) => chat.chatId == chatId) !== undefined) {
      return res.status(400).json({ message: "Not bad" });
    }

    const dataChat = {
      chatId: chatId,
      sender: sender,
    };

    await Notif.updateOne(
      { userId: userId },
      { $push: { chats: dataChat } },
      { new: true }
    );

    let allNotif = await Notif.findOne({ userId: userId })
      .populate("chats.chatId", "chatName isGroupChat")
      .populate("chats.sender", "-password");

    res.json(allNotif);
  }
};

// REMOVE NOTIFICATION BY CHAT ID & USER ID (/notif)
exports.removeNotif = async (req, res, next) => {
  const { userId, chatId } = req.body;

  try {
    await Notif.updateOne(
      { userId: userId },
      { $pull: { chats: { chatId: chatId } } },
      { new: true }
    );

    let updatedNotif = await Notif.findOne({ userId: userId })
      .populate("chats.chatId", "chatName isGroupChat")
      .populate("chats.sender", "-password");

    res.json(updatedNotif);
  } catch (error) {
    next(error);
  }
};

// GET ALL NOTIF (/notif/:userId)
exports.getNotif = async (req, res, next) => {
  const userId = req.params.userId;

  try {
    let allNotif = await Notif.findOne({ userId: userId })
      .populate("chats.chatId", "chatName isGroupChat")
      .populate("chats.sender", "-password");

    if (!allNotif) {
      res.status(404).json({ message: "Not Found!" });
    } else {
      res.json(allNotif);
    }
  } catch (error) {
    next(error);
  }
};
