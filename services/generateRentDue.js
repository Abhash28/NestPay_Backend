const AllocateUnit = require("../model/allocateUnitSchema.js");
const rentDueSchema = require("../model/rentDueSchema.js");

// Helper: converts Date → "YYYY-MM"
const formatMonth = (date) => date.toISOString().slice(0, 7);

const generateRentDue = async () => {
  const today = new Date();
  const currentMonth = formatMonth(today);

  //  Find all ACTIVE allocations that already started
  const allocations = await AllocateUnit.find({
    status: "Active",
    startDate: { $lte: today },
  });

  //  Process each allocation independently
  for (const alloc of allocations) {
    //  STEP 1: Billing day check
    // If today is before billing day → skip
    if (today.getDate() < alloc.billingDay) continue;

    //  STEP 2: Month-level duplicate protection
    if (alloc.lastRentGeneratedMonth === currentMonth) continue;

    //  STEP 3: Database-level duplicate protection
    const alreadyExists = await rentDueSchema.findOne({
      allocationId: alloc._id,
      month: currentMonth,
    });

    // If rent already exists, sync tracker & skip
    if (alreadyExists) {
      alloc.lastRentGeneratedMonth = currentMonth;
      await alloc.save();
      continue;
    }

    //  STEP 4: Create contractual due date
    const dueDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      alloc.billingDay
    );

    //  STEP 5: Create RentDue document
    await rentDueSchema.create({
      allocationId: alloc._id,
      adminId: alloc.adminId,
      propertyId: alloc.propertyId,
      unitId: alloc.unitId,
      tenantId: alloc.tenantId,
      month: currentMonth,
      dueDate,
      rentAmount: alloc.rentAmount,
      status: "Pending",
    });

    // STEP 6: Update allocation tracker
    alloc.lastRentGeneratedMonth = currentMonth;
    await alloc.save();
  }
};

module.exports = generateRentDue;
