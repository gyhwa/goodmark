require('dotenv').config();
const express = require("express");
const router = express.Router();
const ejs = require("ejs");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const _ = require("lodash");


router.get("/", ensureAuthenticated, function(req,res) {
  const username = req.user.username;
  res.render("account/account", {message: "", username: username});
});

router.get("/delete", ensureAuthenticated, function(req,res) {
  res.render("auth/signup");
});


////////////////
router.post("/delete", ensureAuthenticated, function(req, res){
  const username = req.user.username;
  User.findOneAndDelete({username: username},function(err, foundUser){
    if (err) {
      console.log(err);
    } else {
      req.logout();
      res.redirect("/signup")
    }
  });
});

router.post("/password", ensureAuthenticated, function(req, res){
  const username = req.user.username;
  const password = req.user.password;
  const checkPassword = req.body.password;
  if (checkPassword === req.body.newPassword) {
    res.render("account/account", {message: "Same password as the original.", username: username})
  } else {
    bcrypt.genSalt(10, function(err, salt){
    bcrypt.hash(req.body.newPassword, salt, function(err, hash){
      if (err) throw err;

        bcrypt.compare(checkPassword, password, function(err, response) {
                  if (err){
                    console.log(err);
                  }
                  if(response === true){
                    User.findOneAndUpdate({username: username}, {password: hash},function(err, foundUser){
                      if (err) {
                        console.log(err);
                      } else {
                        res.redirect("/dashboard/"+username)
                      }
                    });
                  } else {
                    res.render("account/account", {message: "Wrong original password.", username: username})
                  }
        });
      });
    });
  }



});
////////////////


function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated())
        return next();
    else{
        res.redirect('/login');
    }
}
module.exports = router;
