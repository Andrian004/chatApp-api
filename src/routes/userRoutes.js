const express = require("express");
const router = express.Router();

const verifyToken = require("../middlewares/verifyToken");
const userCtrl = require("../controllers/userCtrl");

router.get("/", verifyToken, userCtrl.search);
router.post("/reg", userCtrl.reg);
router.post("/login", userCtrl.login);

module.exports = router;
