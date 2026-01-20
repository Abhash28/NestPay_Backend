const mongoose = require("mongoose");

const tenantAuthSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "tenant",
      required: true,
    },

    mobileNo: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      default: "tenant",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TenantAuth", tenantAuthSchema);
