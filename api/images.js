const express = require("express");
const mongoose = require("mongoose");
const Grid = require("gridfs-stream");

const router = express.Router();

const connection = mongoose.createConnection(
  process.env.MONGO_URL,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  },
  () => console.log("connected to db (images api)")
);

let gfs;
let gridFSBucket;

connection.once("open", () => {
  gridFSBucket = new mongoose.mongo.GridFSBucket(connection.db, {
    bucketName: "files",
  });

  gfs = Grid(connection.db, mongoose.mongo);
  gfs.collection("files");
});

router.get("/:filename", (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    if (!file || file.length === 0) {
      return res.status(404).json({
        msg: "File doesn't exist",
      });
    }

    if (/image\//.test(file.contentType)) {
      const readstream = gridFSBucket.openDownloadStreamByName(file.filename);
      readstream.pipe(res);
    } else {
      return res.status(404).json({
        msg: "File is not an image",
      });
    }
  });
});

module.exports = router;
