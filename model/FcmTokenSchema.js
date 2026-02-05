const mongoose = require("mongoose");

const FcmTokenSchema = new mongoose.Schema(
  {
    ownerType: {
      type: String,
      enum: ["admin", "tenant"],
      required: true,
    },

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    token: {
      type: String,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("fcmToken", FcmTokenSchema);
