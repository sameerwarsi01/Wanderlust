const express = require("express");
const router = express.Router();

//Index - Users
router.get("/", (req, res) => {
    res.send("Get for users");
});

//Show - Users
router.get("/:id", (req, res) => {
    res.send("Get for user id");
});

//Post - Users
router.post("/", (req, res) => {
    res.send("Post for users");
});

// Delete- Users
router.delete("/:id", (req, res) => {
    res.send("Delete for user id");
});

module.exports = router;