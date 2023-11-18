const mongoose = require("mongoose");

const userModel = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    pic: {
      type: String,
      default:
        "https://res.cloudinary.com/de39dewcq/image/upload/v1699417530/ibdlgnr95abajvsfqtvd.png",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userModel);

module.exports = User;
