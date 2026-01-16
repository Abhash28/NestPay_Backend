const { default: mongoose } = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "adminsignup",
      required: true,
      index: true,
    },
    rentDueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RentDue",
      required: true,
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },

    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Properties",
      required: true,
    },

    unitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Units",
      required: true,
    },
    //razorPay
    orderId: String,
    paymentId: String,
    signature: String,
    amount: {
      type: Number,
      required: true,
    },
    method: {
      type: String,
      enum: ["UPI", "CARD", "NETBANKING", "WALLET"],
    },
    status: {
      type: String,
      enum: ["INITIATED", "SUCCESS", "FAILED"],
      default: "INITIATED",
      index: true,
    },
    paidAt: Date,
    failureReason: String,
  },
  { timestamps: true }
);
module.exports = mongoose.model("payment", paymentSchema);
