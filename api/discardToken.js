const express = require("express");
const router = express.Router();
const jwt = require("next-auth/jwt");
const mongoose = require("mongoose");
const TokenBlacklistSchema = require("../models/TokenBlacklistSchema");

const connection = mongoose.createConnection(
  process.env.MONGO_URL,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  },
  () => console.log("connected to db (tokenBlacklist api)")
);

let Blacklist;

connection.once("open", () => {
  Blacklist = connection.model(
    "Blacklist",
    TokenBlacklistSchema,
    "JWTBlacklist"
  );

  setInterval(async () => {
    try {
      const data = await Blacklist.find({});
      data.forEach((document) => {
        if (
          Math.round(Date.now() / 1000) - document.issue_date >
          parseInt(process.env.TOKEN_DURATION)
        ) {
          document.remove();
        }
      });
    } catch (err) {
      console.log(err);
    }
  }, 600000);
});

const secret = process.env.AUTH_SECRET;

router.post("/", async (req, res) => {
  const token = await jwt.getToken({ req, secret, encryption: true });
  if (token?.token_id && token?.iat) {
    try {
      await Blacklist.create({
        token_id: token.token_id,
        issue_date: token.iat,
      });
      res.json({ msg: "OK" });
    } catch (err) {
      res.status(400).json({ msg: err });
    }
  } else {
    res.status(400).json({ msg: "Token invalid or no token" });
  }
});

module.exports = router;
