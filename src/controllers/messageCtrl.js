const Chat = require("../models/chatModel");
const Message = require("../models/messageModel");
const User = require("../models/userModel");

// SEND MESSAGE (/message)
exports.sendMessage = async (req, res, next) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request!");
    return res.sendStatus(400);
  }

  const messages = await Message.find(
    { chat: chatId },
    {},
    { sort: { createdAt: 1 } }
  );
  if (messages.length > 30) {
    await Message.deleteOne({ _id: messages[0]._id });
  }

  const NewMessage = new Message({
    sender: req.user._id,
    content: content,
    chat: chatId,
  });

  try {
    let message = await NewMessage.save();

    message = await message.populate("sender", "name pic");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, {
      latestMessage: message,
    });

    res.json(message);
  } catch (error) {
    next(error);
  }
};

// FETCHING ALL MESSAGESS (/message/:chatId)
exports.allMessage = async (req, res, next) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");

    res.json(messages);
  } catch (error) {
    next(error);
  }
};

// REMOVE ALL MESSAGES IN DB (/message/:chatId)
exports.removeAllMsg = async (req, res, next) => {
  try {
    await Message.deleteMany({ chat: req.params.chatId });

    res.status(200).json({ message: "Deleted!" });
  } catch (error) {
    next(error);
  }
};
