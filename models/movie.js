let mongoose = require("mongoose");

// Task02: Movie model with attributes for:
// name, description, year, genres and rating
// Note: Posted_by was added to make it easier to remeber who added what movie

let movieSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    genres: {
        type: [String],
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    posted_by: {
        type: String,
        required: true
    }
});

// Export movieSchema
let Movie = module.exports = mongoose.model("Movie",movieSchema);