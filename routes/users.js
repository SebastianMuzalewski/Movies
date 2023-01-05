// Route deticated to deal with user registration and application
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
// Import Express validatior
const { check, validationResult } = require("express-validator");

// Import User Mongoose schemas
let User = require("../models/user");

// Task09: Create route with error validation for registration
// Create register route
router
  .route("/register")
  // Get method renders the register user page
  .get((req, res) => {
    // Render page with list of genres
    res.render("register");
  })
  .post(async (req, res) => {
    // Async validation check of form elements
    await check("name", "Name is required").notEmpty().run(req);
    await check("email", "Email is required").notEmpty().run(req);
    await check("email", "Email is invalid").isEmail().run(req);
    await check("password", "Password is required").notEmpty().run(req);
    await check("confirm_password", "Confirm password is required")
      .notEmpty()
      .run(req);
    await check(
      "confirm_password",
      "Password and confirm password do not match"
    )
      .equals(req.body.password)
      .run(req);

    // Get validation errors
    const errors = validationResult(req);

    if (errors.isEmpty()) {
      // Create new user from mongoose model
      let newUser = new User();
      // Assign attributes based on form data
      newUser.name = req.body.name;
      newUser.email = req.body.email;

      bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(req.body.password, salt, function (err, hashed_password) {
          if (err) {
            console.log(err);
          } else {
            newUser.password = hashed_password;
            // Save new user to MongoDB
            newUser.save(function (err) {
              if (err) {
                // Log error if failed
                console.log(err);
                return;
              } else {
                // Route to login if user created
                res.redirect("/users/login");
              }
            });
          }
        });
      });
    } else {
      // Render form with errors
      res.render("register", {
        errors: errors.array(),
      });
    }
  });

// Task10: Create route with error validation for login
router
  .route("/login")
  .get((req, res) => {
    res.render("login");
  })
  .post(async (req, res, next) => {
    // Check form elements are submitted and valid
    await check("email", "Email is required").notEmpty().run(req);
    await check("email", "Email is invalid").isEmail().run(req);
    await check("password", "Password is required").notEmpty().run(req);

    // Get validation errors
    const errors = validationResult(req);

    if (errors.isEmpty()) {
      // Authenticate using passport and redirect
      passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/users/login",
        failureMessage: true,
      })(req, res, next);
    } else {
      // If form errors then render login with errors
      res.render("login", {
        errors: errors.array(),
      });
    }
  });

// Task11: Create route for logout
router.get("/logout", function (req, res) {
  // Function to logout user
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/users/login");
  });
});

module.exports = router;
