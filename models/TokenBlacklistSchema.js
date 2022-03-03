const mongoose = require("mongoose");

const TokenBlacklistSchema = mongoose.Schema({
  token_id: { type: String, required: true, minLength: 1, unique: true },
  issue_date: { type: Number, required: true, min: 1 },
});

module.exports = TokenBlacklistSchema;
