// Imports
const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const movie = require("../models/movie");

// Import Movie and User Mongoose schemas
let Movie = require("../models/movie");
let User = require("../models/user");

// Movie Genres
let genres = [
  "action",
  "thriller",
  "adventure",
  "horror",
  "drama",
  "science fiction",
];

// Task03: Create router to store routes in movies.js
// movies.js will contain the main functionality for movies in general

// Attach routes to router
router
// Task04/05: Create route for add movie, validate user input, and returns errors
// The route /add is used to add a movie, the .notEmpty function ensures validation
// and returns "attribute" is required for empty values.
  .route("/add")
  // Get method renders the pug add_movie page
  .get(ensureAuthenticated, (req, res) => {
    // Render page with list of genres
    res.render("add_movie", {
      genres: genres,
    });
    // Post method accepts form submission and saves movie in MongoDB
  })
  .post(ensureAuthenticated, async (req, res) => {
    // Async validation check of form elements
    await check("name", "name is required").notEmpty().run(req);
    await check("description", "desctiption is required").notEmpty().run(req);
    await check("year", "Pages is required").notEmpty().run(req);
    await check("genres", "Genre is required").notEmpty().run(req);
    await check("rating", "Rating is required").notEmpty().run(req);

    // Get validation errors
    const errors = validationResult(req);

    if (errors.isEmpty()) {
      // Create new movie from mongoose model
      let movie = new Movie();
      // Assign attributes based on form data
      movie.name = req.body.name;
      movie.description = req.body.description;
      movie.year = req.body.year;
      movie.genres = req.body.genres;
      movie.rating = req.body.rating;
      movie.posted_by = req.user.id;

      // Save movie to MongoDB
      movie.save(function (err) {
        if (err) {
          // Log error if failed
          console.log(err);
          return;
        } else {
          // Route to home to view movies if suceeeded
          res.redirect("/");
        }
      });
    } else {
      res.render("add_movie", {
        // Render form with errors
        errors: errors.array(),
        genres: genres,
      });
    }
  });

// Task06/08: Create route with param of id to display movie details
// res.render renders the movie by passing the movie along with who
// posted the movie
router
  .route("/:id")
  .get((req, res) => {
    // Get movie by id from MongoDB
    // Get user name by id from DB
    Movie.findById(req.params.id, function (err, movie) {
      User.findById(movie.posted_by, function (err, user) {
        if (err) {
          console.log(err);
        }
        res.render("movie", {
          movie: movie,
          posted_by: user.name,
        });
      });
    });
  })
  // Route that returns and deletes movie based on id
  .delete((req, res) => {
    // Restrict delete if user not logged in
    if (!req.user._id) {
      res.status(500).send();
    }

    // Create query dict
    let query = { _id: req.params.id };

    Movie.findById(req.params.id, function (err, movie) {
      // Restrict delete if user did not post movie
      if (movie.posted_by != req.user._id) {
        res.status(500).send();
      } else {
        // MongoDB delete with Mongoose schema deleteOne
        Movie.deleteOne(query, function (err) {
          if (err) {
            console.log(err);
          }
          res.send("Successfully Deleted");
        });
      }
    });
  });

// Task07: Create route with param of id and edit
// Based on the movie id the user gets the to edit the form
router
  .route("/edit/:id")
  .get(ensureAuthenticated, (req, res) => {
    // Get movie by id from MongoDB
    Movie.findById(req.params.id, function (err, movie) {
      // Restrict to only allowing user that posted to make updates
      if (movie.posted_by != req.user._id) {
        res.redirect("/");
      }
      res.render("edit_movie", {
        movie: movie,
        genres: genres,
      });
    });
  })
  .post(ensureAuthenticated, (req, res) => {
    // Create dict to hold movie values
    let movie = {};

    // Assign attributes based on form data
    movie.name = req.body.name;
    movie.description = req.body.description;
    movie.year = req.body.year;
    movie.genres = req.body.genres;
    movie.rating = req.body.rating;

    let query = { _id: req.params.id };

    Movie.findById(req.params.id, function (err, movie_db) {
      // Restrict to only allowing user that posted to make updates
      if (movie_db.posted_by != req.user._id) {
        res.redirect("/");
      } else {
        // Update movie in MongoDB
        Movie.updateOne(query, movie, function (err) {
          if (err) {
            console.log(err);
            return;
          } else {
            res.redirect("/");
          }
        });
      }
    });
  });

// Task12/13: Restrict access to add movie to logged in users &
// Restrict access to edit/delete movie to users who posted movie

// Instead of hardcoding this into each route just create a function
// which will be used to protect users movies from being griefed
function ensureAuthenticated(req, res, next) {
  // If logged in proceed to next middleware
  if (req.isAuthenticated()) {
    return next();
    // Otherwise redirect to login page
  } else {
    res.redirect("/users/login");
  }
}

module.exports = router;
