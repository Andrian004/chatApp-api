const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB is connected...");
  } catch (error) {
    console.log("Error: " + error.massage);
    process.exit();
  }
};

module.exports = connectDB;
