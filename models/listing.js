const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");
const review = require("./review.js");

const listingSchema = new Schema({
    title: {
        type: String,
        required: true
    },

    description: String,

     image: {
        url: {
            type: String,
            default: "https://www.tourmyindia.com/states/goa/image/beaches-goa.webp",
            set: (v) =>
                v === ""
                ? "https://www.tourmyindia.com/states/goa/image/beaches-goa.webp"
                : v,
        },

        filename: {
            type: String,
            default: "listingimage",
        },
    },

    price: Number,
    location: String,
    country: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        },
    ],

    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    }
});

listingSchema.post("findOneAndDelete", async(listing) => {
    if(listing){
        await Review.deleteMany({_id: {$in: listing.reviews}});
    }
});

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;