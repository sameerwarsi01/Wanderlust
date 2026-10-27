const Listing = require("../models/listing.js");
const axios = require("axios");

module.exports.index = async (req, res) => {
  const { category, q } = req.query;
  let allListings;

  if (category) {
    allListings = await Listing.find({ 
      category: { $regex: new RegExp(`^${category.trim()}$`, "i") } 
    });
  } else if (q && q.trim() !== "") {
    let searchQuery = q.trim();
    allListings = await Listing.find({
      $or: [
        { title: { $regex: searchQuery, $options: "i" } },
        { location: { $regex: searchQuery, $options: "i" } },
        { country: { $regex: searchQuery, $options: "i" } },
      ],
    });

    if (allListings.length === 0) {
      req.flash("error", "No listings found matching your search!");
      return res.redirect("/listings");
    }
  } else {
    allListings = await Listing.find({});
  }

  res.render("index.ejs", { allListings, selectedCategory: category });
};

module.exports.renderNewForm = (req, res) => {
  res.render("new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }

  console.log("SHOW LISTING TITLE:", listing.title);
  console.log("SHOW LISTING LOCATION:", listing.location, listing.country);
  console.log("SHOW LISTING GEOMETRY:", listing.geometry);

  res.render("show.ejs", { listing });
};

module.exports.createListing = async (req, res) => {
  console.log("INCOMING_FORM_DATA:", req.body.listing);

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;

  if (req.files && req.files.length > 0) {
    newListing.images = req.files.map((file) => ({
      url: file.path,
      filename: file.filename,
    }));
  }

  const address = `${newListing.location}, ${newListing.country}`;
  const response = await axios.get(
    "https://nominatim.openstreetmap.org/search",
    {
      params: {
        q: address,
        format: "jsonv2",
        limit: 1,
      },
      headers: {
        "User-Agent": "wanderlust-project",
      },
    }
  );

  if (response.data.length > 0) {
    const lat = Number(response.data[0].lat);
    const lon = Number(response.data[0].lon);
    newListing.geometry = {
      type: "Point",
      coordinates: [lon, lat],
    };
  }

  await newListing.save();
  console.log("SAVED_DOCUMENT:", newListing);

  req.flash("success", "New Listing Created!!");
  res.redirect("/listings");
};

// YAHAN ADD HUA HAI RENDER EDIT FORM
module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }

  let originalImageUrl = "";
  if (listing.images && listing.images.length > 0) {
    originalImageUrl = listing.images[0].url.replace("/upload", "/upload/w_250");
  } else if (listing.image && listing.image.url) {
    originalImageUrl = listing.image.url.replace("/upload", "/upload/w_250");
  }

  res.render("edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  console.log("UPDATE_INCOMING_DATA:", req.body.listing);

  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });

  if (req.files && req.files.length > 0) {
    let newImages = req.files.map((file) => ({
      url: file.path,
      filename: file.filename,
    }));
    listing.images.push(...newImages);
    await listing.save();
  }

  console.log("UPDATED_DOCUMENT:", listing);
  req.flash("success", "Listing Updated");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log("DELETED LISTING:", deletedListing);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};