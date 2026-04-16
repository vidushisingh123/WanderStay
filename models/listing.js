const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
        },
    description: String,
    image: {
        filename: String,
        url: {
            type: String,
            default: "https://thumbs.dreamstime.com/b/spring-summer-landscape-blue-sky-clouds-river-boat-green-trees-narew-countryside-grass-poland-water-leaves-58070004.jpg",
            set: (v) => v === ""? "https://thumbs.dreamstime.com/b/spring-summer-landscape-blue-sky-clouds-river-boat-green-trees-narew-countryside-grass-poland-water-leaves-58070004.jpg" : v,
        }
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
    },
    category: {
        type: String,
        enum: ["Trending", "Rooms", "Iconic Cities", "Mountains", "Castles", "Amazing Pools", "Camping", "Farms", "Arctic", "Domes", "Boats"],
    },
    geometry: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point"
        },
        coordinates: {
            type: [Number]
        }
    }
});

listingSchema.post("findOneAndDelete", async(listing) => {
    if(listing) {
        await Review.deleteMany({_id : {$in: listing.reviews}});
    }   
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;