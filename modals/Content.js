var mongoose = require("mongoose");

var contentSchema = new mongoose.Schema(
  {
    content_url: {
      type: String,
      required: true,
    },
    original_owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    hash: {
      type: String,
      required: true,
    },
    supply: { type: Number, default: 1 },
    current_owner: [
      new mongoose.Schema({
        user_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        supply: { type: Number, default: 1 },
        ownership_starts_on: { type: Date, default: Date.now },
        name: { type: String, required: true },
        description: { type: String, default: null },
        description_url: { type: String, default: null },
        isVerified: {
          type: Boolean,
          default: false,
        },
        start_date: { type: String, default: null },
        expiry_date: {
          type: String,
          default: null,
        },
      }),
    ],
    previous_owners: [
      new mongoose.Schema({
        user_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        supply: { type: Number, default: 1 },
        ownership_starts_on: { type: Date },
        ownership_ends_on: { type: Date, default: Date.now },
        name: { type: String, required: true },
        description: { type: String, default: null },
        description_url: { type: String, default: null },
        isVerified: {
          type: Boolean,
          default: false,
        },
        start_date: { type: String, default: null },
        expiry_date: {
          type: String,
          default: null,
        },
      }),
    ],
    type: {
      type: String,
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("Content", contentSchema);
