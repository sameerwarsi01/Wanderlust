require("dotenv").config();

const mongoose = require("mongoose");
const axios = require("axios");
const Listing = require("./models/listing");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

async function updateGeometry() {
    try {
        await mongoose.connect(MONGO_URL);
        console.log("Connected to DB");

        const listings = await Listing.find({});
        console.log("Total listings found:", listings.length);

        let updatedCount = 0;

        for (let listing of listings) {
            try {
                const address = `${listing.location}, ${listing.country}`;
                console.log(`Searching: ${listing.title} -> ${address}`);

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

                    listing.geometry = {
                        type: "Point",
                        coordinates: [lon, lat],
                    };

                    await listing.save();
                    updatedCount++;
                    console.log(`Updated: ${listing.title} -> [${lon}, ${lat}]`);
                } else {
                    console.log(`Location not found: ${address}`);
                }

                // Nominatim rate limit se bachne ke liye
                await new Promise((resolve) => setTimeout(resolve, 1200));

            } catch (err) {
                console.log(`Error updating ${listing.title}:`, err.message);
            }
        }

        console.log("\n✅ Geometry update complete");
        console.log("Total updated listings:", updatedCount);

        await mongoose.connection.close();
    } catch (err) {
        console.log(err);
    }
}

updateGeometry();