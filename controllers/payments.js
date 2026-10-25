const Razorpay = require("razorpay");
const crypto = require("crypto");
const Booking = require("../models/booking");
const Listing = require("../models/listing");
const paymentConfig = require("../config/payment");

// Safe Razorpay instance helper
const getRazorpayInstance = () => {
  const keyId = paymentConfig.keyId || process.env.RAZORPAY_KEY_ID;
  const keySecret = paymentConfig.keySecret || process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay Key ID ya Key Secret .env file me nahi mili!");
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

// 1. Order Creation
module.exports.createOrder = async (req, res) => {
  try {
    const razorpay = getRazorpayInstance();
    const { id } = req.params;

    const body = req.body || {};
    const checkIn = body.checkIn;
    const checkOut = body.checkOut;

    if (!checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: "Please select valid check-in and checkout dates!",
      });
    }

    const listing = await Listing.findById(id);
    if (!listing) {
      return res.status(404).json({ success: false, message: "Listing not found!" });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ success: false, message: "Checkout date must be after check-in date!" });
    }

    const oneDay = 1000 * 60 * 60 * 24;
    const nights = Math.ceil(Math.abs(checkOutDate - checkInDate) / oneDay);

    const basePrice = nights * listing.price;
    const taxAmount = Math.round((basePrice * (paymentConfig.taxRatePercent || 18)) / 100);
    const finalAmount = basePrice + taxAmount;

    const subunitAmount = Math.round(finalAmount * 100);

    const options = {
      amount: subunitAmount,
      currency: paymentConfig.currency || "INR",
      receipt: `rcpt_${Date.now().toString().slice(-8)}`,
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      order,
      keyId: paymentConfig.keyId || process.env.RAZORPAY_KEY_ID,
      appName: paymentConfig.appName || "Wanderlust",
      themeColor: paymentConfig.themeColor || "#fe424d",
      listingTitle: listing.title,
      finalAmount,
      user: {
        name: req.user ? req.user.username : "Guest",
        email: req.user && req.user.email ? req.user.email : "",
      },
    });
  } catch (err) {
    console.error("Razorpay Order Error:", err);
    res.status(500).json({ success: false, message: err.message || "Could not create payment order." });
  }
};

// 2. Verification
module.exports.verifyPayment = async (req, res) => {
  try {
    const keySecret = paymentConfig.keySecret || process.env.RAZORPAY_KEY_SECRET;
    const { id } = req.params;
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      checkIn,
      checkOut,
      totalPrice,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      req.flash("error", "Payment verification failed!");
      return res.status(400).json({ success: false, redirectUrl: `/listings/${id}` });
    }

    const newBooking = new Booking({
      listing: id,
      user: req.user._id,
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
      totalPrice: Number(totalPrice),
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      status: "confirmed",
    });

    await newBooking.save();
    req.flash("success", "Payment successful! Reservation confirmed.");
    res.json({ success: true, redirectUrl: "/bookings" });
  } catch (err) {
    console.error("Payment Verification Error:", err);
    req.flash("error", "Something went wrong during payment verification.");
    res.status(500).json({ success: false, redirectUrl: `/listings/${id}` });
  }
};