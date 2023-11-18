const express = require("express");
const router = express.Router();

const verifyToken = require("../middlewares/verifyToken");
const chatCtrl = require("../controllers/chatCtrl");

router.route("/").post(verifyToken, chatCtrl.accessChat);
router.get("/", verifyToken, chatCtrl.fetchChats);
router.post("/group", verifyToken, chatCtrl.createGroupChat);
router.put("/rename", verifyToken, chatCtrl.renameGroup);
router.put("/groupadd", verifyToken, chatCtrl.addToGroup);
router.put("/groupremove", verifyToken, chatCtrl.removeFromGroup);

module.exports = router;
