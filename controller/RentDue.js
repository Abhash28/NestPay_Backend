const RentDueSchema = require("../model/RentDueSchema");

const getAllRentDue = async (req, res, next) => {
  const adminId = req.admin.id;

  const rentDues = await RentDueSchema.find({ adminId })
    .populate("tenantId")
    .populate("propertyId")
    .populate("unitId");

  res.json({
    count: rentDues.length,
    rentDues,
  });
};

//show all  rent for perticullar  tenant we filter according to use in history show only paid and in home page show only pending rent
const tenantPendingRent = async (req, res, next) => {
  const { id } = req.tenant;
  try {
    const allRent = await RentDueSchema.find({ tenantId: id });
    res.json({ allRent });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllRentDue, tenantPendingRent };
