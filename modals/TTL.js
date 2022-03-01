var mongoose = require("mongoose");

var TTLSchema = new mongoose.Schema(
  {
    owner_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    content_id: { type: mongoose.Schema.Types.ObjectId, ref: "Content" },
    bidding_id: { type: mongoose.Schema.Types.ObjectId, ref: "Bidding" },
    // is_closed: { type: Boolean, default: false },
    expireAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);
TTLSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });
module.exports = mongoose.model("TTL", TTLSchema);
