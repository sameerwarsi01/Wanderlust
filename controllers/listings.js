const Listing = require("../models/listing.js");
const axios = require("axios");

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("index.ejs", { allListings });
}

module.exports.renderNewForm = (req, res) => {
    res.render("new.ejs");
};

module.exports.showListing = async(req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
    .populate({ path: "reviews",
        populate: {
            path: "author",
        }
    })
    .populate("owner");
    if(!listing){
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    
    console.log("SHOW LISTING TITLE:", listing.title);
    console.log("SHOW LISTING LOCATION:", listing.location, listing.country);
    console.log("SHOW LISTING GEOMETRY:", listing.geometry);

    res.render("show.ejs", { listing });
};

module.exports.createListing = async (req, res) => {
    let url = req.file.path;
    let filename = req.file.filename;

    const newListing = new Listing(req.body.listing);

    newListing.owner = req.user._id;
    newListing.image = { url, filename };

    const address = `${newListing.location}, ${newListing.country}`;
    console.log("Address:", address);

    const response = await axios.get(
        "https://nominatim.openstreetmap.org/search",
        {
            params: {
                q: address,
                format: "jsonv2",
                limit: 1,
            },
            headers: {
                "User-Agent": "wanderlust-project"
            }
        }
    );

    console.log("Nominatim response:", response.data);

    if (response.data.length > 0) {
        const lat = Number(response.data[0].lat);
        const lon = Number(response.data[0].lon);

        newListing.geometry = {
            type: "Point",
            coordinates: [lon, lat],
        };

        console.log("Before save geometry:", newListing.geometry);
    } else {
        console.log("Location not found for:", address);
    }

    await newListing.save();

    console.log("After save geometry:", newListing.geometry);

    req.flash("success", "New Listing Created!!");
    res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    res.render("edit.ejs", {listing, originalImageUrl});
};

module.exports.updateListing = async(req, res) => {
    let { id } = req. params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});

    if(typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
    }
    req.flash("success", "Listing Updated");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async(req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};
