const mongoose = require("mongoose");
const unitSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "adminSignup",
      required: true,
    },

    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Properties",
      required: true,
    },
    unitName: {
      type: String,
      required: true,
    },
    monthlyRent: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["vacant", "occupied"],
      default: "vacant",
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "tenant",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);
module.exports = mongoose.model("units", unitSchema);
