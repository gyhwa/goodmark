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

router.get("/create", ensureAuthenticated, function(req, res){
  res.render("collection/createCollection", {user: req.user.username});
})

router.get("/:collection/add", function(req, res){
  const requestedCollection = req.params.collection;
  res.render("collection/createItem", {requestedCollection: requestedCollection});
})


router.get("/:collection/update", function(req,res) {
  const requestedCollection = req.params.collection;
  User.find({"group._id": requestedCollection}, function(err, foundUser){
    if (err){
      console.log(err);
    } else {
      const collectionName =foundUser[0].group.filter(function(obj) {
          return obj.id == requestedCollection
        })[0].name;
      res.render("collection/updateCollection", {requestedCollection: requestedCollection, collectionName: collectionName});
    }
  })
});

router.get("/:collection/:list/update", function(req,res) {
  const requestedCollection = req.params.collection;
  const requestedItem = req.params.list;
  User.find({"group.items._id": requestedItem}, function(err, foundUser){
    if (err){
      console.log(err);
    } else {
      const items =foundUser[0].group.filter(function(obj) {
          return obj.id == requestedCollection;
        })[0].items;
      const itemName = items.filter(function(obj) {
          return obj.id == requestedItem;
        })[0].name;
      const itemUrl = items.filter(function(obj) {
          return obj.id == requestedItem;
        })[0].url;
      const itemNotes = items.filter(function(obj) {
          return obj.id == requestedItem;
        })[0].notes;
      res.render("collection/updateItem", {requestedCollection: requestedCollection, requestedItem: requestedItem, itemName: itemName, itemUrl: itemUrl, itemNotes:itemNotes});
    }
  })

});


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

router.post("/:collection/update", ensureAuthenticated, function(req,res) {
  const newName = req.body.name;
  const collectionID = req.params.collection;
  const username = _.lowerCase(req.user.username);
  User.findOneAndUpdate({"group._id": collectionID}, { $set: {"group.$.name": newName}},function(err, foundUser){
    if (err) {
      console.log(err);
    } else {
      res.redirect("/dashboard/"+username)
    }
  });
});


// add a list item in the collection
router.post("/:collection/add", ensureAuthenticated, function(req, res){
  const collection = req.params.collection;
  const username = _.lowerCase(req.user.username);
  if (req.user) {
    const newItem = new Item({
      name: req.body.name,
      url: req.body.url,
      notes: req.body.notes
    });
    User.findOne({username: username}, function(err, foundUser){
      if(err) {
        console.log(err);
      } else {
        foundUser.group.forEach(function(group){
          if (group._id == collection){
            group.items.push(newItem);
            foundUser.save();
            return res.redirect("/dashboard/" + username);
          } else {
            console.log(err);
          }
        })
      }
    })
  } else {
    res.redirect("/dashboard/" + username);
  }
});


//delete item within param collection
router.post("/:collection/delete", ensureAuthenticated, function(req, res){
  const collection = req.params.collection
  const deleteItem = req.body.deleteItem;
  const username = req.user.username;
  User.findOneAndUpdate({"group.items._id": deleteItem}, { $pull: {"group.$.items": {_id:deleteItem}}},function(err, foundUser){
    if (err) {
      console.log(err);
    } else {
      res.redirect("/dashboard/"+username)
    }
  });
});


router.post("/:collection/:item/update", ensureAuthenticated, function(req,res) {
  const newName = req.body.name;
  const newURL = req.body.url;
  const newNotes = req.body.notes;
  const newDate = Date.now();
  const update = {name: newName, url: newURL, notes: newNotes,  date: newDate};
  const itemID = req.params.item;
  const username = _.lowerCase(req.user.username);

  User.findOneAndUpdate({"group.items._id": itemID}, { $set: {"group.$.items": update}},function(err, foundUser){
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
        res.redirect('/login');
    }
}
module.exports = router;
