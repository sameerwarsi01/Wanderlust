const Booking = require("../models/booking")
const Listing = require("../models/listing");

module.exports.createBooking = async (req, res) => {
    const { id } = req.params;
    const { checkIn, checkOut, totalPrice } = req.body.booking;

    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if(checkOutDate <= checkInDate){
        req.flash("error", "Checkout date must be after check-in date!")
        return res.redirect(`/listings/${id}`);
    }

    const newBooking = new Booking({
        listing: id,
        user: req.user._id,
        checkIn: checkInDate,
        checkOut:  checkOutDate,
        totalPrice: Number(totalPrice),
    });

    await newBooking.save();
    req.flash("success", "Reservation confirmed successfully!")
    res.redirect("/bookings");
}; 

module.exports.index = async (req, res) => {
    const bookings = await Booking.find({ user: req.user._id})
    .populate("listing")
    .sort({ createdAt: -1 });

    res.render("bookings/index.ejs" ,  {bookings});
};

module.exports.destroyBooking = async (req, res) => {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId);

    if(!booking) {
        req.flash("error", "Booking not found!");
        return res.redirect("/bookings");
    };

    if(!booking.user.equals(req.user._id)) {
        req.flash("error", "You do not have permission to cancel this booking!")
        return res.redirect("/bookings");
    };

    await Booking.findByIdAndDelete(bookingId);
    req.flash("success", "Booking canceled successfully!");
    return res.redirect("/bookings");
};