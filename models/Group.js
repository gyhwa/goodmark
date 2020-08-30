const mongoose = require("mongoose");
const ItemSchema = require("./Item.js");
const Schema = mongoose.Schema;


// Create Schema
const GroupSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  index: Number,
  items: [ItemSchema]
});

module.exports = GroupSchema
