const mongoose = require("mongoose");
const GroupSchema = require("./Group.js");
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');




// Create Schema
const UserSchema = new Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  group: [GroupSchema]
});

UserSchema.plugin(passportLocalMongoose);

module.exports = User = mongoose.model('User', UserSchema);
