const express = require("express");
const verifyToken = require("../middlewares/verifyToken");
const router = express.Router();

const notifCtrl = require("../controllers/notifCtrl");

router.post("/", verifyToken, notifCtrl.sendNotif);
router.get("/:userId", verifyToken, notifCtrl.getNotif);
router.patch("/", verifyToken, notifCtrl.removeNotif);

module.exports = router;
