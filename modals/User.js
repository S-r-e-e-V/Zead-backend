const mongoose = require("mongoose");

var userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
    },
    bio: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      default: null,
    },
    wallet_address: {
      type: String,
      unique: true,
      required: true,
    },
    website: {
      type: String,
      default: null,
    },
    twitter_handle: {
      type: String,
      default: null,
    },
    instagram_handle: {
      type: String,
      default: null,
    },
    discord_handle: {
      type: String,
      default: null,
    },
    profile_image: {
      type: String,
      default: null,
    },
    profile_banner: {
      type: String,
      default: null,
    },
    followers: [
      // new mongoose.Schema(
      //   {
      //     user_id: {
      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      //     },
      //   },
      //   { timestamps: true }
      // ),
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    favourite_content: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Content",
      },
    ],
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("User", userSchema);
