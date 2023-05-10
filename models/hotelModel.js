const mongoose = require("mongoose");

const ImageSchema = new mongoose.Schema({
    image_url: {
        type: String,
        required: true
    },
    image_id: {
        type: String,
        required: true
    }
});

const ReviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
    },
    title: {
        type: String
    },
    review: {
        type: String
    }
})

const HotelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    distance: {
        type: String,
        required: true
    },
    landmark: {
        type: String,
    },
    lattitude: {
        type: Number,
    },
    longitude: {
        type: Number,
    },
    photos: {
        type: [ImageSchema]
    },
    desc: {
        type: String,
        required: true
    },
    ratings: [ReviewSchema],
    rooms: {
        type: [String]
    },
    cheapestPrice: {
        type: Number,
        required: true
    },
    featured: {
        type: Boolean,
        default: false
    }
})

const hotels = mongoose.model('hotels', HotelSchema);

module.exports = hotels;