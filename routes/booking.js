const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn } = require("../middleware");

const bookingController = require("../controllers/bookings");
const paymentController = require("../controllers/payments");

router.post("/listings/:id/create-order", isLoggedIn, wrapAsync(paymentController.createOrder));
router.post("/listings/:id/verify", isLoggedIn, wrapAsync(paymentController.verifyPayment));
router.get("/bookings", isLoggedIn, wrapAsync(bookingController.index));
router.delete("/bookings/:bookingId", isLoggedIn, wrapAsync(bookingController.destroyBooking));

module.exports = router;