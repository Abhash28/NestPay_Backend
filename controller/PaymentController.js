const crypto = require("crypto");
const RentDueSchema = require("../model/RentDueSchema");
const PaymentSchema = require("../model/PaymentSchema");
const razorpay = require("../config/razorpayConfig");
const createError = require("http-errors");
const FcmToken = require("../model/FcmTokenSchema");
const {
  pushNotification,
} = require("../services/Notification/pushNotification");
const PDFDocument = require("pdfkit");
const { sendWhatsapp } = require("../services/Whatsapp/whatsappService");

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

    //  Notify TENANT & ADMIN after 30 seconds (online payment)

    setTimeout(async () => {
      try {
        // Tenant tokens
        const tenantTokens = await FcmToken.find({
          ownerType: "tenant",
          ownerId: payment.tenantId,
          isActive: true,
        });

        if (tenantTokens.length) {
          pushNotification(
            tenantTokens.map((t) => t.token),
            "✅ Payment Successful",
            `We received ₹${payment.amount} for your rent. Thank you for paying on time.`,
            "https://nest-pay.in",
          );
        }

        // Admin tokens
        const adminTokens = await FcmToken.find({
          ownerType: "admin",
          ownerId: payment.adminId,
          isActive: true,
        });

        if (adminTokens.length) {
          pushNotification(
            adminTokens.map((t) => t.token),
            "💰 Rent Payment Received",
            `₹${payment.amount} rent payment received successfully.`,
            "https://nest-pay.in",
          );
        }
      } catch (err) {
        console.error("Delayed payment notification error:", err);
      }
    }, 30 * 1000); // ⏱️ 30 seconds

    //whatsapp messagae while online payment confirmation
    //  Fetch RentDue with tenant details
    const rentDue = await RentDueSchema.findById(payment.rentDueId).populate(
      "tenantId",
      "tenantName tenantMobileNo",
    );

    if (!rentDue) {
      return next(createError(404, "Rent due not found"));
    }

    const paidDate = payment.paidAt.toLocaleDateString("en-GB");
    const month = new Date(rentDue.dueDate).toLocaleString("en-IN", {
      month: "short",
      year: "numeric",
    });
    // adjust if different field

    //  Send WhatsApp
    await sendWhatsapp({
      phone: rentDue.tenantId.tenantMobileNo,
      templateId: "04794253-97bb-40f3-9612-9148f4b9db27",
      params: [
        rentDue.tenantId.tenantName,
        month,
        String(payment.amount),
        payment.method.toUpperCase(),
        paidDate,
      ],
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
    const { rentDueId, cashRemark } = req.body;
    const adminId = req.admin.id;

    const rentDue = await RentDueSchema.findById(rentDueId).populate(
      "tenantId",
      "tenantName tenantMobileNo",
    );

    if (!rentDue) {
      return res.status(404).json({ message: "Rent due not found" });
    }

    if (rentDue.status === "Paid") {
      return res.status(400).json({ message: "Rent already paid" });
    }

    const now = new Date();

    let payment = await PaymentSchema.findOne({
      rentDueId,
      adminId,
    });

    if (payment) {
      payment.method = "CASH";
      payment.cashRemark = cashRemark;
      payment.status = "SUCCESS";
      payment.paidAt = now;
      payment.amount = rentDue.rentAmount;
      await payment.save();
    } else {
      payment = await PaymentSchema.create({
        adminId,
        rentDueId,
        tenantId: rentDue.tenantId._id,
        propertyId: rentDue.propertyId,
        unitId: rentDue.unitId,
        amount: rentDue.rentAmount,
        method: "CASH",
        cashRemark,
        status: "SUCCESS",
        paidAt: now,
      });
    }

    rentDue.status = "Paid";
    rentDue.paidAmount = rentDue.rentAmount;
    rentDue.paidAt = now;
    await rentDue.save();

    const paidDate = now.toLocaleDateString("en-GB");
    const month = new Date(rentDue.dueDate).toLocaleString("en-IN", {
      month: "short",
      year: "numeric",
    });
    // adjust to your schema

    // 🔔 FCM
    const tenantTokens = await FcmToken.find({
      ownerType: "tenant",
      ownerId: rentDue.tenantId._id,
      isActive: true,
    });

    if (tenantTokens.length) {
      pushNotification(
        tenantTokens.map((t) => t.token),
        "✅ Rent Payment Received",
        `₹${rentDue.rentAmount} rent has been received in cash.`,
        "https://nest-pay.in",
      ).catch(console.error);
    }

    // 📲 WhatsApp
    await sendWhatsapp({
      phone: rentDue.tenantId.tenantMobileNo,
      templateId: "04794253-97bb-40f3-9612-9148f4b9db27",
      params: [
        rentDue.tenantId.tenantName,
        month,
        String(payment.amount),
        payment.method,
        paidDate,
      ],
    });

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
      .populate("unitId", "unitName")
      .populate("rentDueId", "month");
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

//export pdf in history
const downloadPaymentPdf = async (req, res) => {
  try {
    const adminId = req.admin.id;
    const { month, year, status } = req.query;

    /* ---------- FILTER ---------- */
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(
      now.getMonth() + 1,
    ).padStart(2, "0")}`;

    let filter = { adminId };

    if (month && year) {
      filter.month = `${year}-${month}`;
    } else {
      filter.month = { $lt: currentMonth };
    }

    if (status) filter.status = status;

    const rentDues = await RentDueSchema.find(filter)
      .populate("tenantId", "tenantName")
      .populate("propertyId", "propertyName")
      .populate("unitId", "unitName")
      .sort({ month: -1 });

    /* ---------- DATA PREP ---------- */
    const rows = [];

    for (let r of rentDues) {
      const payment = await PaymentSchema.findOne({
        rentDueId: r._id,
        status: "SUCCESS",
      });

      rows.push({
        tenant: r.tenantId?.tenantName || "-",
        propertyUnit: `${r.propertyId?.propertyName || "-"} / ${
          r.unitId?.unitName || "-"
        }`,
        amount: `${r.rentAmount}`,
        status: r.status,
        method: payment?.method || "-",
        rrn: payment?.rrn || "-",
        dueDate: r.dueDate
          ? new Date(r.dueDate).toLocaleDateString("en-IN")
          : "-",
        paidOn: payment?.paidAt
          ? new Date(payment.paidAt).toLocaleDateString("en-IN")
          : "-",
      });
    }

    /* ---------- PDF ---------- */
    const doc = new PDFDocument({ margin: 30, size: "A4" });
    const chunks = [];

    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => {
      const pdfBuffer = Buffer.concat(chunks);
      res.json({
        success: true,
        file: pdfBuffer.toString("base64"),
        fileName: "payment-history.pdf",
      });
    });

    /* ---------- HEADER ---------- */
    doc
      .font("Helvetica-Bold")
      .fontSize(20)
      .text("PAYMENT HISTORY", { align: "center" });

    doc.moveDown(0.5);

    const monthLabel =
      month && year
        ? `${new Date(`${year}-${month}-01`).toLocaleString("en-IN", {
            month: "long",
          })} ${year}`
        : "Previous Months";

    doc
      .font("Helvetica")
      .fontSize(11)
      .text(`Month : ${monthLabel}`, { align: "center" });

    doc
      .fontSize(9)
      .fillColor("gray")
      .text(`Generated on : ${new Date().toLocaleDateString("en-IN")}`, {
        align: "center",
      });

    doc.moveDown(1.5);
    doc.fillColor("black");

    /* ---------- TABLE ---------- */
    const columns = [
      { label: "Tenant", width: 90 },
      { label: "Property / Unit", width: 110 },
      { label: "Amount", width: 47 },
      { label: "Status", width: 50 },
      { label: "Method", width: 47 },
      { label: "RRN", width: 80 },
      { label: "Due Date", width: 52 },
      { label: "Paid On", width: 52 },
    ];

    const rowHeight = 30;
    let y = doc.y;
    const xStart = doc.page.margins.left;

    /* ---------- TABLE HEADER ---------- */
    doc.font("Helvetica-Bold").fontSize(9);
    let x = xStart;

    columns.forEach((c) => {
      doc.rect(x, y, c.width, rowHeight).fillAndStroke("#F1F5F9", "#CBD5E1");
      doc.fillColor("black").text(c.label, x + 5, y + 6, {
        width: c.width - 10,
      });
      x += c.width;
    });

    y += rowHeight;
    doc.font("Helvetica").fontSize(9);

    /* ---------- ROWS ---------- */
    rows.forEach((r) => {
      if (y + rowHeight > doc.page.height - 40) {
        doc.addPage();
        y = doc.page.margins.top;
      }

      const data = [
        r.tenant,
        r.propertyUnit,
        r.amount,
        r.status,
        r.method,
        r.rrn,
        r.dueDate,
        r.paidOn,
      ];

      let xRow = xStart;

      data.forEach((cell, i) => {
        doc.rect(xRow, y, columns[i].width, rowHeight).stroke();
        doc.text(String(cell), xRow + 5, y + 6, {
          width: columns[i].width - 10,
        });
        xRow += columns[i].width;
      });

      y += rowHeight;
    });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "PDF generation failed",
    });
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
  downloadPaymentPdf,
  recentPaidTenant,
  paidRent,
  transactionDetail,
};
