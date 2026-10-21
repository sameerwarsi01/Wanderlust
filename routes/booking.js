const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapasync = require("../utils/wrapAsync");
const { isLoggedIn } = require("../middleware");
const bookingController = require("../controllers/bookings");

// Create Booking for listing
router.post(
    "/listings/:id/bookings",
    isLoggedIn,
    wrapasync(bookingController.createBooking)
); 

// View user's bookings
router.get(
    "/bookings",
    wrapasync(bookingController.index)
);

// Cancel booking
router.delete(
    "/bookings/:bookingId",
    isLoggedIn,
    wrapasync(bookingController.destroyBooking)
);

module.exports = router;