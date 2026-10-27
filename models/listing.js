const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const imageSchema = new Schema({
    url: String,
    filename: String,
});

const listingSchema = new Schema({
    title: {
        type: String,
        required: true
    },

    description: String,
    images: [imageSchema],

    image: {
        url: String,
        filename: String,
    },
    
    price: Number,
    location: String,
    country: String,
    category: {
        type: String,
        required: true,
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        },
    ],

    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    geometry: {
    type: {
        type: String,
        enum: ["Point"],
        default: "Point",
    },

    category: {
        type: String, 
        enum: [
            "Trending",
            "Rooms",
            "Iconic Cities",
            "Mountain",
            "Castles",
            "Amazing Pools",
            "Camping",
            "Farms",
            "Arctic",
            "Domes",
            "Boats",
        ],
    },
    
    coordinates: {
        type: [Number],
    },
},
});

listingSchema.post("findOneAndDelete", async(listing) => {
    if(listing){
        await Review.deleteMany({_id: {$in: listing.reviews}});
    }
});

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;