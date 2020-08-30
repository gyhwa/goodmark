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
    res.render("dashboardAdmin", {user: req.user.username, collections: req.user.group});
  } else {
    res.render("dashboardGuest", {user: requestedUser});
  }
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
