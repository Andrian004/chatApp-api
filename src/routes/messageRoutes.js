const express = require("express");
const router = express.Router();

const messageCtrl = require("../controllers/messageCtrl");
const verifyToken = require("../middlewares/verifyToken");

router.post("/", verifyToken, messageCtrl.sendMessage);
router.get("/:chatId", verifyToken, messageCtrl.allMessage);
router.delete("/:chatId", verifyToken, messageCtrl.removeAllMsg);

module.exports = router;
