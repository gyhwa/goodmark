require('dotenv').config();
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");

//const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
// Load User model
const User = require("../models/User.js");
const pattern = RegExp(/^[a-z0-9]+$/);


const passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy({
    passReqToCallback: true
  },
  function(req, username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      if (!user) {
        return done(null, false, req.flash('message', 'Incorrect username.' ));
      }
      if(err) {
        return  done(null, false, { message: err + 'Error in passport.' });
      }
      bcrypt.compare(password, user.password, function(err, res) {
                if (err){
                  return done(null, false,  req.flash('message', 'Incorrect password.' ));
                }
                if(res === true){
                    return done(null,user);
                } else {
                    return done(null, false, req.flash('message', 'Incorrect password.' ));
                }
      });

      //return done(null, user);
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

router.use(function(req, res, next) {
    res.locals.loggedin = req.user || null;
    next();
});


//////////////////////////////////// GET ///////////////////////////////////
router.get("/", function(req,res) {
  res.render("home")
});

router.get("/about", function(req,res) {
  res.render("about")
});

router.get("/register", function(req,res){
  res.render("auth/register", {message:""})
});


router.get('/login', function(req, res, next) {
  const message = req.flash('message');
  passport.authenticate('local', function(err, user, info) {
    if (err) { return done(err);}
    if (!user) {
      return res.render('auth/login', { message: message });
    }
  })(req, res, next);
});

router.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});
//////////////////////////////////// REGISTER ///////////////////////////////////
// @route POST api/users/register
// @desc Register user
// @access Public
router.post("/register", function(req, res) {
  if (!pattern.test(req.body.name)){
    return res.render("auth/register", {message: "Username must be only lowercase letters and numbers with no spaces."})
  }
  User.findOne({ email: req.body.email }).then(user => {
      if (user) {
        res.render("auth/register", {message: "Email already exists"})
        //return res.status(400).json({ email: "Email already exists" });
      } else {
        User.findOne({ username: req.body.name }).then(user =>{
          if (user) {
            res.render("auth/register", {message: "Username already exists"})
          } else {
            // Successful registration
            const newUser = new User({
              username: req.body.name,
              email: req.body.email,
              password: req.body.password
            });
            // Hash password before saving in database
            bcrypt.genSalt(10, function(err, salt){
            bcrypt.hash(newUser.password, salt, function(err, hash){
              if (err) throw err;
              newUser.password = hash;

              newUser.save()
                .then(user => res.json(user))
                .catch(err => console.log(err));
              res.redirect("/login")
              });
            });
          }
        });


    // end of first else
    }
  });
});




//////////////////////////////////// LOGIN ///////////////////////////////////
// @route POST api/users/login
// @desc Login user and return JWT token
// @access Public
router.post("/login", function(req, res){
  const password = req.body.password;
  const username = req.body.username;
  const user = new User({
    username: username,
    password: password
  });

  req.login(user, function(err){
    if (err) {
      res.redirect("/login");
    } else {
      passport.authenticate("local", {
        failureRedirect: '/login', failureFlash: true})(req, res, function(){
        const currentUser =  _.lowerCase(req.user.username)
        res.redirect("/dashboard/"+currentUser);
      });
    }
  });


});





module.exports = router;
