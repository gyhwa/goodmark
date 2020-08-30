require('dotenv').config();
const express = require("express");
const router = express.Router();
const ejs = require("ejs");
const mongoose = require("mongoose");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const _ = require("lodash");


router.get("/:username", ensureAuthenticated, function(req,res){
  const requestedUser = _.lowerCase(req.params.username);
  const currentUser = _.lowerCase(req.user.username);
  if (requestedUser == currentUser) {
    //render indexAdmin
    res.render("dashboard/dashboardUser", {user: req.user.username, collections: req.user.group, isUser: true});
  } else {
    User.findOne({username: requestedUser}, function(err, foundUser){
      if (err) {
        console.log(err)
      } else {
        const collections = foundUser.group;
        res.render("dashboard/dashboardUser", {user: requestedUser, collections: collections, isUser: false});
      }
    });
  }
})

//// TODO:
// look into reduce
// apply .sort to array
// filter out specific users
router.get("/", function(req,res) {
  User.find({}, function(err, users){
    console.log("todo")
  })
  res.render("dashboard/dashboard")
})

////////////////


function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated())
        return next();
    else{
        res.redirect('/login')
    }
}



module.exports = router;
