if(process.env.NODE_ENV != "production") {
    require('dotenv').config();
}

const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const {cloudinary} = require("../cloudConfig.js");
const axios = require("axios");
const fs = require("fs");


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

async function updateImages() {
  const listings = await Listing.find({});

  for (let listing of listings) {
    try {
      const imageUrl = listing.image.url;

      // skip if already cloudinary
      if (imageUrl.includes("cloudinary")) {
        console.log("Already updated");
        continue;
      }

      // download image temporarily
      const response = await axios({
        url: imageUrl,
        method: "GET",
        responseType: "stream",
      });

      const filePath = `./temp.jpg`;
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      await new Promise((resolve) => writer.on("finish", resolve));

      // upload to cloudinary
      const result = await cloudinary.uploader.upload(filePath);

      // update DB
      listing.image.url = result.secure_url;
      listing.image.filename = result.public_id;

      await listing.save();

      console.log("Updated:", listing.title);

      fs.unlinkSync(filePath); // delete temp file
    } catch (err) {
      console.log("Error:", err.message);
    }
  }

  mongoose.connection.close();
}

updateImages();