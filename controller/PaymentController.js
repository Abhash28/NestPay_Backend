const crypto = require("crypto");
const RentDueSchema = require("../model/RentDueSchema");
const PaymentSchema = require("../model/PaymentSchema");
const razorpay = require("../config/razorpayConfig");
const createError = require("http-errors");

// when user click on pay btn then backend create order for payement

const createOrder = async (req, res, next) => {
  try {
    const { rentDueId } = req.body;

    const rentDue = await RentDueSchema.findById(rentDueId);
    //check rent availble or not
    if (!rentDue) {
      return next(createError(404, "Rent Due not found"));
    }
    //check rent paid or not
    if (rentDue.status === "Paid") {
      return next(createError(400, "Rent Already Paid"));
    }
    //check existing inittiated payment (while click and cancel multiple time order create agin again and again)
    const existingPayment = await PaymentSchema.findOne({
      rentDueId: rentDue._id,
      status: "INITIATED",
    });
    //if order already exist then reuse
    if (existingPayment) {
      return res.json({
        orderId: existingPayment.orderId,
        amount: existingPayment.amount * 100,
        key: process.env.RAZORPAY_KEY_ID,
        payment: existingPayment,
        reused: true,
      });
    }
    //create order
    const order = await razorpay.orders.create({
      amount: rentDue.rentAmount * 100,
      currency: "INR",
      receipt: `Rent ${rentDue._id}`,
    });

    //create history in payment schema when user click on pay button
    const payment = await PaymentSchema.create({
      adminId: rentDue.adminId,
      rentDueId: rentDue._id,
      tenantId: rentDue.tenantId,
      propertyId: rentDue.propertyId,
      unitId: rentDue.unitId,
      orderId: order.id,
      amount: rentDue.rentAmount,
      status: "INITIATED",
    });
    res.json({
      orderId: order.id,
      amount: order.amount,
      key: process.env.RAZORPAY_KEY_ID,
      payment,
    });
  } catch (error) {
    next(error);
  }
};

//verify payment
const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    //  Find payment using orderId
    const payment = await PaymentSchema.findOne({
      orderId: razorpay_order_id,
    });

    if (!payment) {
      return next(createError(404, "Payment record not found"));
    }

    // Create signature on backend
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    // Compare signatures
    if (expectedSignature !== razorpay_signature) {
      payment.status = "FAILED";
      payment.failureReason = "Signature mismatch";
      await payment.save();

      return next(createError(400, "Invalid payment signature"));
    }

    // Fetch Razorpay payment info
    const razorpayPayment = await razorpay.payments.fetch(razorpay_payment_id);
    //must be captured
    if (razorpayPayment.status !== "captured") {
      payment.status = "FAILED";
      payment.failureReason = `Payment status: ${razorpayPayment.status}`;
      await payment.save();

      return next(createError(400, "Payment not captured"));
    }

    //  save details
    payment.paymentId = razorpay_payment_id;
    payment.signature = razorpay_signature;
    payment.method = razorpayPayment.method;
    payment.vpa = razorpayPayment.vpa;
    payment.rrn = razorpayPayment.acquirer_data?.rrn;
    payment.status = "SUCCESS";
    payment.paidAt = new Date();

    await payment.save();

    // Update Rent Due
    await RentDueSchema.findByIdAndUpdate(payment.rentDueId, {
      status: "Paid",
      paidAmount: payment.amount,
      paidAt: new Date(),
    });

    res.json({
      success: true,
      message: "Payment verified successfully",
    });
  } catch (error) {
    next(error);
  }
};

//if admin mark cash then direct create order for cash
const markCashPayment = async (req, res, next) => {
  try {
    const { rentDueId } = req.body;
    const adminId = req.admin.id;

    const rentDue = await RentDueSchema.findById(rentDueId);
    if (!rentDue) {
      return res.status(404).json({ message: "Rent due not found" });
    }

    if (rentDue.status === "Paid") {
      return res.status(400).json({ message: "Rent already paid" });
    }

    // create payment record
    await PaymentSchema.create({
      adminId,
      rentDueId,
      tenantId: rentDue.tenantId,
      propertyId: rentDue.propertyId,
      unitId: rentDue.unitId,
      amount: rentDue.rentAmount,
      method: "CASH",
      status: "SUCCESS",
      paidAt: new Date(),
    });

    // update rent due
    rentDue.status = "Paid";
    rentDue.paidAmount = rentDue.rentAmount;
    rentDue.paidAt = new Date();
    await rentDue.save();

    res.status(200).json({
      success: true,
      message: "Cash payment marked successfully",
    });
  } catch (error) {
    next(error);
  }
};

//fetch recent payment for admin dashboard stats
const recentPaid = async (req, res, next) => {
  const { id } = req.admin;
  try {
    const recentPayment = await PaymentSchema.find({
      adminId: id,
      status: "SUCCESS",
    })
      .sort({ createdAt: -1 }) // latest first
      .limit(3)
      .populate("tenantId", "tenantName")
      .populate("unitId", "unitName");
    res.json({ success: true, message: "Recent Payment", recentPayment });
  } catch (error) {
    next(error);
  }
};

// payment history admin side
const paymentHistory = async (req, res, next) => {
  try {
    const adminId = req.admin.id;
    const { month, year, status } = req.query;

    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(
      now.getMonth() + 1,
    ).padStart(2, "0")}`;

    let filter = { adminId };

    // 🔹 Month logic
    if (month && year) {
      // Admin explicitly selected a month (ALLOW current month)
      filter.month = `${year}-${month}`;
    } else {
      // Default → previous months only
      filter.month = { $lt: currentMonth };
    }

    // 🔹 Status logic
    if (status) {
      filter.status = status;
    } else {
      filter.status = "Paid";
    }

    const rentDue = await RentDueSchema.find(filter)
      .populate("tenantId", "tenantName")
      .populate("propertyId", "propertyName")
      .populate("unitId", "unitName")
      .sort({ month: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Payment History",
      rentDue,
    });
  } catch (error) {
    next(error);
  }
};

// recent payment for tenant dashboard home page to show last payment
const recentPaidTenant = async (req, res, next) => {
  const { id } = req.tenant;
  try {
    const recentPayment = await PaymentSchema.find({
      tenantId: id,
      status: "SUCCESS",
    })
      .sort({ createdAt: -1 }) // latest first
      .limit(2)
      .populate("rentDueId", "month dueDate")
      .populate("tenantId", "tenantName")
      .populate("unitId", "unitName");
    res.json({
      success: true,
      message: "Recent Payment in tenant side",
      recentPayment,
    });
  } catch (error) {
    next(error);
  }
};

//fetch all paid or success payment for tenant history
const paidRent = async (req, res, next) => {
  const { id } = req.tenant;
  try {
    const paymentHistory = await PaymentSchema.find({
      tenantId: id,
      status: "SUCCESS",
    }).populate("rentDueId", "month dueDate");
    res.json({ success: true, message: "All Paid payment", paymentHistory });
  } catch (error) {
    next(error);
  }
};

//show payment detail in admin and tenant both side
const transactionDetail = async (req, res, next) => {
  const { rentDueId } = req.params;

  try {
    const detail = await PaymentSchema.findOne({ rentDueId });

    if (!detail) {
      return res.status(404).json({
        success: false,
        message: "No transaction found for this rent",
      });
    }

    res.status(200).json({
      success: true,
      message: "Transaction Detail",
      detail,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  markCashPayment,
  recentPaid,
  paymentHistory,
  recentPaidTenant,
  paidRent,
  transactionDetail,
};
