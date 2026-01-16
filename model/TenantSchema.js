const mongoose = require("mongoose");

const TenantSchema = new mongoose.Schema(
  {
    tenantName: {
      type: String,
      required: true,
    },

    tenantMobileNo: {
      type: Number,
      required: true,
    },

    tenantAddress: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["Active", "Inactive", "Pending-Deactivation"],
      default: "Active",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "adminSignup",
      required: true,
    },

    unitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "units",
      default: null,
    },
    startDate: {
      type: Date,
      default: null,
    },

    // Deactivation-related fields
    endDate: {
      type: Date,
      default: null,
    },

    deactivateReason: {
      type: String,
      enum: ["Tenant Left", "Non Payment", "Rule Violation", "Other"],
      default: null,
    },

    deactivateRemark: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

module.exports = mongoose.model("tenant", TenantSchema);
