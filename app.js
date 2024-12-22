//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const app = express();
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
// const md5 = require("md5");

const bcrypt = require("bcrypt");
const saltRounds = 10;

app.use(express.static("public"));

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true,
});

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

// const secret = "Thisisourlittlesecret.";
userSchema.plugin(encrypt, {
  secret: process.env.SECRET,
  encryptedFields: ["password"],
});

const User = new mongoose.model("User", userSchema);

app.post("/register", function (req, res) {
  bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
    const newUser = new User({
      email: req.body.username,
      password: hash,
    });

    newUser
      .save()
      .then(() => {
        res.render("secrets");
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send("An error occurred during registration.");
      });
  });
});

app.post("/login", async function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  try {
    const foundUser = await User.findOne({ email: username });
    if (foundUser) {
      bcrypt.compare(password, foundUser.password, function (err, result) {
        if (result === true) {
          res.render("secrets");
        } else {
          res.status(401).send("Invalid password.");
        }
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("An error occurred during login.");
  }
});

app.get("/", function (req, res) {
  res.render("home");
});

app.get("/login", function (req, res) {
  res.render("Login");
});

app.get("/register", function (req, res) {
  res.render("Register");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
