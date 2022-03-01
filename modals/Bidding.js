var mongoose = require("mongoose");

var biddingSchema = new mongoose.Schema(
  {
    owner_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    content_id: { type: mongoose.Schema.Types.ObjectId, ref: "Content" },
    is_closed: { type: Boolean, default: false },
    bidders: [
      new mongoose.Schema(
        {
          user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          price: {
            type: String,
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
module.exports = mongoose.model("Bidding", biddingSchema);
