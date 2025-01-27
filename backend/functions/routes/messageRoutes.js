const express = require("express");
const router = express.Router();
const messagesController = require("../controllers/messagesController");

router.post("/send", messagesController.sendMessage);
router.get("/", messagesController.getMessages);

module.exports = router;

