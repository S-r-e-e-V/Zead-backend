var mongoose = require("mongoose");

var salesSchema = new mongoose.Schema(
  {
    seller_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    buyer_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    content_id: { type: mongoose.Schema.Types.ObjectId, ref: "Content" },
    bidding_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bidding",
      default: null,
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
module.exports = mongoose.model("Sales", salesSchema);
