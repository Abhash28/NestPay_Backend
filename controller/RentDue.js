const RentDueSchema = require("../model/RentDueSchema");

const getAllRentDue = async (req, res, next) => {
  const adminId = req.admin.id;

  const rentDues = await RentDueSchema.find({ adminId });

  res.json({
    count: rentDues.length,
    rentDues,
  });
};

module.exports = { getAllRentDue };
