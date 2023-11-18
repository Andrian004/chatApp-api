const bcrypt = require("bcrypt");
const saltRounds = 10;
const validator = require("validator");
const jwt = require("jsonwebtoken");
const generateToken = require("../utils/generateToken");

const User = require("../models/userModel");

// REGISTER (/user/reg)
exports.reg = async (req, res, next) => {
  const { username, email, password, pic } = req.body;

  // validate email
  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: "Email tidak valid!" });
  }

  const emailExist = await User.findOne({ email: email });
  if (emailExist) {
    return res.status(400).json({ message: "Email sudah digunakan!" });
  }

  // validate password
  if (!validator.isLength(password, { min: 6 })) {
    return res.status(400).json({
      message: "Password minimal berisi 6 karakter!",
    });
  }

  // hash password
  const salt = await bcrypt.genSalt(saltRounds);
  const hashPass = await bcrypt.hash(password, salt);

  // declare new user
  const RegModel = new User({
    name: username,
    email: email,
    password: hashPass,
    pic: pic,
  });

  // save new user to db
  try {
    const userData = await RegModel.save();

    const token = generateToken({
      _id: userData._id,
      username: userData.name,
      email: userData.email,
    });

    res.status(201).json({
      message: "Register berhasil!",
      pic: userData.pic,
      token: token,
    });
  } catch (err) {
    res.status(400).json({ message: "Register gagal!", error: err });
  }
};

// LOGIN (/user/login)
exports.login = async (req, res) => {
  const { email, password } = req.body;

  // find user by email
  const user = await User.findOne({ email: email });

  // compare email
  if (!user) {
    return res.status(400).json({ message: "Email anda salah!" });
  }

  // compare password
  const validPass = await bcrypt.compare(password, user.password);
  if (!validPass) {
    return res.status(400).json({ message: "Pasword anda salah!" });
  }

  // jwt token
  const payload = {
    _id: user._id,
    username: user.name,
    email: user.email,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "30d" });

  res
    .status(200)
    .json({ message: "Login berhasil!", token: token, pic: user.pic });
};

// SEARCH USER (/user?search)
exports.search = async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });

  res.send(users);
};
