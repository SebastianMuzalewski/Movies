/* @authors: Sebastian @Date:09/12/22 
 * @Course&Section: Modern Web Technologies/CPAN-212-0NB
 * The purpose of this Application is to create a movie application.
 * It is able to add, display, edit and delete movies. Along with providing
 * user validation to protect user additions and edits.
 */ 

/* Programmer Notes:
 * npm start | Starts the project on, http://localhost:8000/
 */

/* Reader Notes:
 * Tasks will be listed in the following manner: Task##: Explination
 * Tasks may also be split or combined
 * Additional comments may be provided to understand logic and flow.
 * Task 14: Deploy application to Heroku. This task is not implemented 
 * since Herokus free trial ended a while ago.
 */

// Task01: Create new Express app with Pug templates
// Created new express app with index.js as the main app and create pug templates
// based on the routes needed.

// All imports for the movie project 
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const cors = require('cors')
const config = require("./config/database");

// All routes
var movie_routes = require("./routes/movies");
var user_routes = require("./routes/users");

// Task02: Create Mongoose connection
// Connect to the database while checking the connection and
// return any errors if they occur.
mongoose.connect(config.database);
let db = mongoose.connection;

db.once("open", function () {
  console.log("Connected to MongoDB");
});

db.on("error", function (err) {
  console.log("DB Error");
});

// Initialize express app
const app = express();

// Built-in middleware used for urlencoding and json
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

// Initialize session
app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {},
}));

// Passport config
require("./config/passport")(passport);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Enable CORS on all routes
app.use(cors())

// Import Movie Mongoose schemas
let Movie = require("./models/movie");

// Load view engine
app.set("/", path.join(__dirname, "views"));
app.set("view engine", "pug");

// Wildcard route to allow user to be used in templates
app.get("*", function(req, res, next){
    res.locals.user = req.user || null;
    next();
})

// More routes
app.use("/users", user_routes);
app.use("/movie", movie_routes);

app.use("/", function (req, res) {
  // Query MongoDB for movies
  Movie.find({}, function (err, movies) {
    // Catch error
    if (err) {
      console.log("error");
    } else {
      // Pass movies to index
      res.render("index", {
        movies: movies,
      });
    }
  });
});

// Set constant for port
const PORT = process.env.PORT || 8000;

// Listen on a port
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
