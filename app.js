//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const flash = require('connect-flash');
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

//route const
const users = require("./routes/users")
const dashboard = require("./routes/dashboard")
const collection = require("./routes/collection")

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

//createasession
app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: 604800000,
    httpOnly: false
  }
}));
app.use(flash());
const connectionstring = "mongodb+srv://admin-gina:"+process.env.MONGOURI+"@cluster0.zwkcj.mongodb.net/bookmarkDB?retryWrites=true&w=majority";
mongoose.connect(connectionstring, {useNewUrlParser: true,useUnifiedTopology: true});
//mongoose.connect("mongodb://localhost:27017/bookmarkDB", {useNewUrlParser: true,useUnifiedTopology: true});
mongoose.set("useCreateIndex", true);


//passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/", users);
app.use("/dashboard", dashboard);
app.use("/collection", collection);



app.listen(3000, function() {
  console.log("Server started on port 3000.");
});
