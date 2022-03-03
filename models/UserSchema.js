const mongoose = require("mongoose");

const PostSchema = mongoose.Schema(
  {
    title: { type: String },
    content: { type: String },
    imageFileName: { type: String, required: true, minLength: 1 },
  },
  {
    timestamps: true,
  }
);

const UserSchema = mongoose.Schema(
  {
    username: { type: String, required: true, minLength: 1, unique: true },
    email: { type: String, required: true, minLength: 1, unique: true },
    password: { type: String, required: true, minLength: 1 },
    posts: [PostSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = UserSchema;
