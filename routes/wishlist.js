const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn } = require("../middleware");
const wishlistController = require("../controllers/wishlist");

router.get("/", isLoggedIn, wrapAsync(wishlistController.index));
router.post("/:id/toggle", isLoggedIn, wrapAsync(wishlistController.toggleWishlist));

module.exports = router;