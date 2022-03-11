var mongoose = require("mongoose");

var collectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
    },
    url: { type: String, default: "" },
    description: { type: String, default: "" },
    logo_image: { type: String, default: "" },
    featured_image: { type: String, default: "" },
    banner_image: { type: String, default: "" },
    category: { type: String, default: "" },
    website: { type: String, default: "" },
    twitter_handle: { type: String, default: "" },
    instagram_handle: { type: String, default: "" },
    discord_handle: { type: String, default: "" },
    medium: { type: String, default: "" },
    blockchain_type: { type: String, default: "Polygon" },
    is_sensitive: { type: String, default: false },
    original_owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    other_owners: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("Collection", collectionSchema);
