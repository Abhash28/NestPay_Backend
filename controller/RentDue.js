const mongoose = require("mongoose");
const RentDueSchema = require("../model/RentDueSchema");
const PaymentSchema = require("../model/PaymentSchema");

const getAllRentDue = async (req, res, next) => {
  try {
    const adminId = req.admin.id;

    const today = new Date();
    const currentMonth = today.toISOString().slice(0, 7); // YYYY-MM

    const rentDues = await RentDueSchema.find({
      adminId,
      $or: [
        // Always show current month
        { month: currentMonth },

        //  Show ONLY unpaid previous months
        {
          month: { $lt: currentMonth },
          status: { $in: ["Pending", "Overdue"] },
        },
      ],
    })
      .populate("tenantId", "tenantName tenantMobileNo")
      .populate("propertyId")
      .populate("unitId")
      .sort({ month: -1, updatedAt: -1 });

    res.json({
      count: rentDues.length,
      rentDues,
    });
  } catch (error) {
    next(error);
  }
};

//show all  rent for perticullar  tenant we filter according to use in history show only paid and in home page show only pending rent
const tenantPendingRent = async (req, res, next) => {
  const { id } = req.tenant;
  try {
    const allRent = await RentDueSchema.find({ tenantId: id }).populate(
      "tenantId",
      "tenantName tenantMobileNo",
    );
    res.json({ allRent });
  } catch (error) {
    next(error);
  }
};

// total collection this month

const totalCollection = async (req, res, next) => {
  try {
    const adminId = new mongoose.Types.ObjectId(req.admin.id);

    const now = new Date();

    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const thisMonthTotal = await PaymentSchema.aggregate([
      {
        $match: {
          adminId: adminId,
          status: "SUCCESS",
          paidAt: {
            $gte: startOfThisMonth,
            $lt: startOfNextMonth,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    const lastMonthTotal = await PaymentSchema.aggregate([
      {
        $match: {
          adminId: adminId,
          status: "SUCCESS",
          paidAt: {
            $gte: startOfLastMonth,
            $lt: startOfThisMonth,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    const thisMonthSum = thisMonthTotal[0]?.totalAmount || 0;
    const lastMonthSum = lastMonthTotal[0]?.totalAmount || 0;

    res.status(200).json({
      success: true,
      thisMonthSum,
      lastMonthSum,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllRentDue, tenantPendingRent, totalCollection };
