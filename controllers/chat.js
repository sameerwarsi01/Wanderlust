const Conversation = require("../models/conversation");
const Listing = require("../models/listing");
const mongoose = require("mongoose");

module.exports.renderInbox = async (req, res) => {
    const conversations = await Conversation.find({
        participants: req.user._id,
    })
        .populate("listing")
        .populate("participants", "username email")
        .sort({ updatedAt: -1 });

    res.render("chat/inbox.ejs", { conversations, activeChat: null });
};

module.exports.openChat = async (req, res) => {
    const { listingId } = req.params;
    const listing = await Listing.findById(listingId).populate("owner");

    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }

    if (listing.owner._id.equals(req.user._id)) {
        return res.redirect("/chat/inbox");
    }

    let conversation = await Conversation.findOne({
        listing: listing._id,
        participants: { $all: [req.user._id, listing.owner._id] }
    })
        .populate("listing")
        .populate("participants", "username email")
        .populate("messages.sender", "username");

    if (!conversation) {
        conversation = new Conversation({
            listing: listing._id,
            participants: [req.user._id, listing.owner._id],
            messages: [],
        });
        await conversation.save();
        await conversation.populate("listing");
        await conversation.populate("participants", "username email");
    }

    if (!Array.isArray(conversation.messages)) {
        conversation.messages = [];
    }

    const conversations = await Conversation.find({
        participants: req.user._id,
    })
        .populate("listing")
        .populate("participants", "username email")
        .sort({ updatedAt: -1 });

    res.render("chat/inbox.ejs", { conversations, activeChat: conversation });
};

module.exports.openConversation = async (req, res) => {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId)
        .populate("listing")
        .populate("participants", "username email")
        .populate("messages.sender", "username");

    if (!conversation) {
        req.flash("error", "Conversation not found!");
        return res.redirect("/chat/inbox");
    }

    const conversations = await Conversation.find({
        participants: req.user._id,
    })
        .populate("listing")
        .populate("participants", "username email")
        .sort({ updatedAt: -1 });

    res.render("chat/inbox.ejs", { conversations, activeChat: conversation });
};

// 4. Send Message
module.exports.sendMessage = async (req, res) => {
    const { conversationId } = req.params;
    const { text } = req.body;

    if (!text || text.trim() === "") {
        return res.status(400).json({ success: false, message: "Message cannot be empty" });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
        return res.status(404).json({ success: false, message: "Chat not found" });
    }

    if (!conversation.messages) {
        conversation.messages = [];
    }

    const newMsg = {
        sender: req.user._id,
        text: text.trim(),
        createdAt: new Date(),
    };

    conversation.messages.push(newMsg);
    conversation.updatedAt = new Date();
    await conversation.save();

    if (req.xhr || req.headers.accept?.includes("json")) {
        return res.json({
            success: true,
            message: newMsg,
            senderId: req.user._id.toString(),
            senderName: req.user.username,
        });
    }

    res.redirect(`/chat/c/${conversation._id}`);
};