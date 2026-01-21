const mongoose = require("mongoose");

const adminProfileSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "adminSignup",
      required: true,
      unique: true,
    },
    name: {
      type: String,
    },
    mobileNo: {
      type: String,
    },

    address: {
      type: String,
      trim: true,
    },

    pincode: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("AdminProfile", adminProfileSchema);
