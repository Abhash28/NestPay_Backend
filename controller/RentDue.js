const RentDueSchema = require("../model/RentDueSchema");

const getAllRentDue = async (req, res, next) => {
  try {
    const adminId = req.admin.id;

    const today = new Date();
    const currentMonth = today.toISOString().slice(0, 7); // "YYYY-MM"

    const rentDues = await RentDueSchema.find({
      adminId,
      month: currentMonth,
    })
      .populate("tenantId", "tenantName tenantMobileNo")
      .populate("propertyId")
      .populate("unitId")
      .sort({
        updatedAt: -1,
      });

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

module.exports = { getAllRentDue, tenantPendingRent };
