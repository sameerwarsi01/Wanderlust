const User = require("../models/user");
const Listing = require("../models/listing");

// 1. Wishlist View
module.exports.index = async (req, res) => {
    const user = await User.findById(req.user._id).populate("wishlist");
    const validWishlist = (user.wishlist || []).filter(item => item !== null && item._id);
    res.render("wishlist/index.ejs", { wishlist: validWishlist });
};

// 2. Toggle Wishlist (Add / Remove)
module.exports.toggleWishlist = async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(req.user._id);

    if (!user) {
        return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    if (!Array.isArray(user.wishlist)) {
        user.wishlist = [];
    }

    const listingIndex = user.wishlist.findIndex(
        (item) => item && item.toString() === id.toString()
    );

    let added = false;
    if (listingIndex !== -1) {
        user.wishlist.splice(listingIndex, 1);
        added = false;
    } else {
        user.wishlist.push(id);
        added = true;
    }

    await user.save();
    return res.json({
        success: true,
        added,
        message: added ? "Added to wishlist" : "Removed from wishlist",
    });
};