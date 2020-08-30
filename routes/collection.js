require('dotenv').config();
const express = require("express");
const router = express.Router();
const ejs = require("ejs");
const mongoose = require("mongoose");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const _ = require("lodash");

const GroupSchema = require("../models/Group.js");
const ItemSchema = require("../models/Item.js");

Group = mongoose.model('Group', GroupSchema);
Item = mongoose.model('Item', ItemSchema);

mongoose.set('useFindAndModify', false);

router.get("/create", function(req, res){
  res.render("collection/createCollection");
})

router.get("/:collection/add", function(req, res){
  const requestedCollection = req.params.collection;
  res.render("collection/createItem", {requestedCollection: requestedCollection});
})
/////////////////////

router.post("/create", ensureAuthenticated, function(req,res){
  const currentUser = _.lowerCase(req.user.username);
  if (req.user) {
    const length = req.user.group.length;
    const newCollection = new Group({
      name: req.body.name,
      index:length
    });
    req.user.group.push(newCollection);
    req.user.save();
    res.redirect("/dashboard/" + currentUser)
  } else {
    res.redirect("/dashboard/" + currentUser)
  }
})

router.post("/delete", function(req, res){
  const deleteCollection = req.body.deleteCollection;
  const username = req.user.username;
  User.findOneAndUpdate({username: username}, {$pull: {group: {_id: deleteCollection}}},function(err, foundUser){
    if (err) {
      console.log(err);
    } else {
      res.redirect("/dashboard/"+username)
    }
  });
});

router.post("/update", function(req,res) {
  console.log(req.body.collectionId)
  console.log(document.getElementById(req.body.collectionId).innerHTML)
});


router.post("/:collection/add", ensureAuthenticated, function(req, res){
  const collection = req.params.collection;
  const currentUser = _.lowerCase(req.user.username);
  if (req.user) {
    const newItem = new Item({
      name: req.body.name,
      url: req.body.url,
      notes: req.body.notes
    });
    User.findOne({username: req.user.username}, function(err, foundUser){
      if(err) {
        console.log(err);
      } else {
        foundUser.group.forEach(function(group){
          if (group._id == collection){
            group.items.push(newItem);
            foundUser.save();
            return res.redirect("/dashboard/" + currentUser);
          } else {
            console.log(err);
          }
        })
      }
    })
  } else {
    res.redirect("/dashboard/" + currentUser)
  }
})

//TODO
router.post("/:collection/delete", ensureAuthenticated, function(req, res){
  const collection = req.params.collection
  const deleteItem = req.body.deleteItem;
  const username = req.user.username;

  User.findOneAndUpdate({username: username}, {$pull: {group: {items: {_id: deleteItem}}}},function(err, foundUser){
    if (err) {
      console.log(err);
    } else {
      res.redirect("/dashboard/"+username)
    }
  });
});
////////////////


function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated())
        return next();
    else{
        res.redirect('/login')
    }
}
module.exports = router;
