const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// Create Schema
const ItemSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  notes: {
    type: String,
    required: true
  }
});

//const Item = mongoose.model("Item", ItemSchema);

module.exports = ItemSchema;
