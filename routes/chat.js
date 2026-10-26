const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chat.js");
const { isLoggedIn } = require("../middleware.js");

router.get("/inbox", isLoggedIn, chatController.renderInbox);

router.get("/c/:conversationId", isLoggedIn, chatController.openConversation);

router.get("/:listingId", isLoggedIn, chatController.openChat);

router.post("/message/send/:conversationId", isLoggedIn, chatController.sendMessage);

module.exports = router;