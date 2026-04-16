if(process.env.NODE_ENV != "production") {
    require('dotenv').config();
}

const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const axios = require("axios");

// connect DB
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main().then(() => {
    console.log("connected to DB");
}).catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect(MONGO_URL);
}

async function geocodeListings() {
  const listings = await Listing.find({});

  for (let listing of listings) {
    try {
      // skip if already has coordinates
      if (listing.geometry && listing.geometry.coordinates.length > 0) {
        console.log("Already has coordinates");
        continue;
      }

      let location = listing.location + ", " + listing.country;

      // API call
      const res = await axios.get("https://nominatim.openstreetmap.org/search", {
        params: {
          q: location,
          format: "json",
          limit: 1
        },
        headers: {
          "User-Agent": "major-project"
        }
      });

      if (res.data.length > 0) {
        const lat = res.data[0].lat;
        const lon = res.data[0].lon;

        listing.geometry = {
          type: "Point",
          coordinates: [parseFloat(lon), parseFloat(lat)]
        };

        await listing.save();

        console.log("Updated:", listing.geometry);
      } else {
        console.log("No result for:", location);
      }

      // ⚠️ delay (important to avoid rate limit)
      await new Promise(r => setTimeout(r, 1000));

    } catch (err) {
      console.log("Error:", err.message);
    }
  }

  mongoose.connection.close();
}

geocodeListings();