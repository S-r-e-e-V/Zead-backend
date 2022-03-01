const mongoose = require("mongoose");

var notificationSchema = new mongoose.Schema(
  {
    send_to: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    message: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("Notification", notificationSchema);
