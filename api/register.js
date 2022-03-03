const express = require("express");
const router = express.Router();
const Joi = require("joi");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const axios = require("axios");

const UserSchema = require("../models/UserSchema");

const connection = mongoose.createConnection(
  process.env.MONGO_URL,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  },
  () => console.log("connected to db (register api)")
);

let User;

connection.once("open", () => {
  User = connection.model("User", UserSchema);
});

const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),

  password: Joi.string().min(6).max(30).required(),

  email: Joi.string()
    .email({
      minDomainSegments: 2,
    })
    .required(),
});

router.post("/", async (req, res) => {
  const response = (
    await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      undefined,
      {
        params: {
          secret: process.env.SECRET_RECAPTCHA_KEY,
          response: req.body.token,
        },
      }
    )
  ).data;
  if (!response.success) {
    const error = "Invalid Recaptcha token";
    return res
      .status(400)
      .json({ username: error, password: error, email: error });
  } else if (response.score < 0.5) {
    const error = `Trust factor too low. Your score: ${response.score}`;
    return res
      .status(400)
      .json({ username: error, password: error, email: error });
  }

  const data = {
    username: req.body.username,
    password: req.body.password,
    email: req.body.email,
  };
  const { error } = registerSchema.validate(data);

  if (error) {
    const response = {};
    response[error.details[0].path[0]] = error.details[0].message;
    return res.status(400).json(response);
  }

  bcrypt.hash(req.body.password, 10, (err, hash) => {
    if (err) {
      return res.status(500).json({ msg: "Internal error" });
    }
    User.create({ ...req.body, password: hash })
      .then(() => res.json({ msg: "OK" }))
      .catch((err) => {
        const response = {};
        if (err.keyPattern?.email === 1) {
          response.email = "Email already exists";
        }

        if (err.keyPattern?.username === 1) {
          response.username = "Username already exists";
        }

        res.status(400).json(response);
      });
  });
});

module.exports = router;
