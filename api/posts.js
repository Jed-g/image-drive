const express = require("express");
const crypto = require("crypto");
const mongoose = require("mongoose");
const Grid = require("gridfs-stream");
const GridFsStorage = require("multer-gridfs-storage");
const path = require("path");
const jwt = require("next-auth/jwt");

const secret = process.env.AUTH_SECRET;

const router = express.Router();
const UserSchema = require("../models/UserSchema");
const TokenBlacklistSchema = require("../models/TokenBlacklistSchema");

const connection = mongoose.createConnection(
  process.env.MONGO_URL,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  },
  () => console.log("connected to db (posts api)")
);

let User;
let gfs;
let Blacklist;

connection.once("open", () => {
  gfs = Grid(connection.db, mongoose.mongo);
  gfs.collection("files");
  User = connection.model("User", UserSchema);
  Blacklist = connection.model(
    "Blacklist",
    TokenBlacklistSchema,
    "JWTBlacklist"
  );
});

const validateToken = async (req, res, next) => {
  try {
    const token = await jwt.getToken({ req, secret, encryption: true });

    if (!token) {
      return res.status(401).json({ msg: "NOT AUTHORIZED" });
    }

    if (!token.token_id || !token.iat) {
      return res.status(401).json({ msg: "NOT AUTHORIZED" });
    }

    if (await Blacklist.findOne({ token_id: token.token_id })) {
      return res.status(401).json({ msg: "NOT AUTHORIZED" });
    }

    if (
      Math.round(Date.now() / 1000) - token.iat >
      parseInt(process.env.TOKEN_DURATION)
    ) {
      return res.status(401).json({ msg: "NOT AUTHORIZED" });
    }

    next();
  } catch (err) {
    res.status(401).json({ msg: "NOT AUTHORIZED" });
  }
};

const storage = new GridFsStorage({
  url: process.env.MONGO_URL,
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  file: (req, file) => {
    return new Promise(async (resolve, reject) => {
      let filename;
      do {
        filename =
          crypto.randomBytes(32).toString("hex") +
          path.extname(file.originalname);
      } while (
        await new Promise((resolve, reject) => {
          gfs.files.findOne({ filename }, (err, file) => {
            if (!file || file.length === 0) {
              resolve(false);
            } else {
              resolve(true);
            }
          });
        })
      );

      const fileInfo = {
        filename,
        bucketName: "files",
      };
      resolve(fileInfo);
    });
  },
});

const multer = require("multer")({
  storage,
  limits: { fileSize: 33554432 },
  // 32MB
  fileFilter: function (req, file, cb) {
    if (!/image\//.test(file?.mimetype)) {
      return cb(new Error("FILE IS NOT IMAGE"));
      // cb(null, false) <- to just skip upload
    }

    cb(null, true);
  },
});

const fileUpload = multer.single("file");

router.post("/", validateToken, async (req, res) => {
  const token = await jwt.getToken({ req, secret, encryption: true });
  const user = await User.findById(token?.user_id);
  if (!user) {
    return res.status(401).json({ msg: "NOT AUTHORIZED" });
  }

  fileUpload(req, res, async (err) => {
    if (err) {
      res.status(400).json({ msg: err.message });
    } else {
      try {
        user.posts.push({
          title: req.body?.title,
          content: req.body?.content,
          imageFileName: req.file?.filename,
        });
        await user.save();
        res.json({ msg: "OK" });
      } catch (err) {
        res.status(400).json({ msg: "BAD REQUEST", description: err });
      }
    }
  });
});

router.get("/", validateToken, async (req, res) => {
  const token = await jwt.getToken({ req, secret, encryption: true });
  const user = await User.findById(token?.user_id);
  if (!user) {
    return res.status(401).json({ msg: "NOT AUTHORIZED" });
  }

  try {
    res.json(user.posts.sort((a, b) => b.createdAt - a.createdAt));
  } catch (err) {
    res.status(400).json({ msg: "BAD REQUEST", description: err });
  }
});

router.delete("/", validateToken, async (req, res) => {
  const token = await jwt.getToken({ req, secret, encryption: true });
  const user = await User.findById(token?.user_id);
  if (!user) {
    return res.status(401).json({ msg: "NOT AUTHORIZED" });
  }

  try {
    // alternative -> user.posts.filter(post => post._id === req.query.id)
    const post = user.posts.id(req.query.id);
    post?.imageFileName &&
      gfs.remove({
        filename: post.imageFileName,
        root: "files",
      });
    post.remove();
    await user.save();
    res.json({ msg: "OK" });
  } catch (err) {
    res.status(400).json({ msg: "BAD REQUEST", description: err });
  }
});

module.exports = router;
