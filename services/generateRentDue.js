const AllocateUnit = require("../model/allocateUnitSchema.js");
const RentDue = require("../model/RentDueSchema.js");

const formatMonth = (date) => date.toISOString().slice(0, 7);

const generateRentDue = async () => {
  const today = new Date();

  const allocations = await AllocateUnit.find({
    status: "Active",
    startDate: { $lte: today },
  });

  for (const alloc of allocations) {
    // decide correct billing month
    const billingMonthDate =
      today.getDate() <= alloc.billingDay
        ? new Date(today.getFullYear(), today.getMonth(), 1) //current month
        : new Date(today.getFullYear(), today.getMonth() + 1, 1); //next month

    const billingMonth = formatMonth(billingMonthDate);

    // skip if already generated
    if (alloc.lastRentGeneratedMonth === billingMonth) continue;

    const alreadyExists = await RentDue.findOne({
      allocationId: alloc._id,
      month: billingMonth,
    });

    if (alreadyExists) {
      alloc.lastRentGeneratedMonth = billingMonth;
      await alloc.save();
      continue;
    }

    // create due date safely (future or today)
    const dueDate = new Date(
      billingMonthDate.getFullYear(),
      billingMonthDate.getMonth(),
      alloc.billingDay,
      12,
      0,
      0,
    );

    await RentDue.create({
      allocationId: alloc._id,
      adminId: alloc.adminId,
      propertyId: alloc.propertyId,
      unitId: alloc.unitId,
      tenantId: alloc.tenantId,
      month: billingMonth,
      dueDate,
      rentAmount: alloc.rentAmount,
      status: "Pending",
    });

    alloc.lastRentGeneratedMonth = billingMonth;
    await alloc.save();
  }
};

module.exports = generateRentDue;
