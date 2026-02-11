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
    const adminId = req.admin.id;

    const now = new Date();

    //start of this month (01/02/2026)
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    //start of next month (01/03/2026)
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    // start of last month (01/01/2026)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // THIS MONTH
    const thisMonthPayments = await PaymentSchema.find({
      adminId,
      status: "SUCCESS",
      paidAt: {
        $gte: startOfThisMonth,
        $lt: startOfNextMonth,
      },
    })
      .populate("tenantId propertyId unitId")
      .sort({ paidAt: -1 });

    // LAST MONTH
    const lastMonthPayments = await PaymentSchema.find({
      adminId,
      status: "SUCCESS",
      paidAt: {
        $gte: startOfLastMonth,
        $lt: startOfThisMonth,
      },
    })
      .populate("tenantId propertyId unitId")
      .sort({ paidAt: -1 });

    res.status(200).json({
      success: true,
      thisMonth: {
        count: thisMonthPayments.length,
        payments: thisMonthPayments,
      },
      lastMonth: {
        count: lastMonthPayments.length,
        payments: lastMonthPayments,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllRentDue, tenantPendingRent, totalCollection };
