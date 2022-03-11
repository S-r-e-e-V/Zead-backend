var mongoose = require("mongoose");

var contentSchema = new mongoose.Schema(
  {
    original_owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ipfs_hash: {
      type: String,
      required: true,
    },
    // image/video/3D...
    content_type: {
      type: String,
      required: true,
    },
    supply_number: {
      type: Number,
    },
    blockchain_type: { type: String, default: "Polygon" },
    freeze: { type: Boolean, default: false },
    // make it true when an item is deleted by user
    is_deleted: { type: Boolean, default: false },
    collection_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Collection",
    },
    name: { type: String, required: true },
    description: { type: String, default: null },
    external_link: { type: String, default: null },
    properties: [
      new mongoose.Schema({
        key: { type: String, default: null },
        value: { type: String, default: null },
      }),
    ],
    levels: [
      new mongoose.Schema({
        key: { type: String, default: null },
        value: { type: Number, default: null },
        out_of: { type: Number, default: null },
      }),
    ],
    stats: [
      new mongoose.Schema({
        key: { type: String, default: null },
        value: { type: Number, default: null },
        out_of: { type: Number, default: null },
      }),
    ],
    // locable item revealed by the owner of the item
    unlockable_content: { type: String, default: null },
    // active for sale
    is_active: {
      type: Boolean,
      default: false,
    },
    // sensitive content
    is_sensitive: { type: Boolean, default: false },
    start_date: { type: String, default: null },
    expiry_date: {
      type: String,
      default: null,
    },
    price: {
      type: String,
      default: "",
    },
    current_owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    previous_owners: [
      new mongoose.Schema(
        {
          user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
        },
        { timestamps: true }
      ),
    ],
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("Content", contentSchema);
