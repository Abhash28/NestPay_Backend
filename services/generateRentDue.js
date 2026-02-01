const AllocateUnit = require("../model/allocateUnitSchema");
const RentDue = require("../model/RentDueSchema");

/**
 * YYYY-MM formatter (timezone-safe)
 */
const formatMonth = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
};

/**
 * Move to next month
 */
const addMonth = (year, month) => {
  const d = new Date(year, month - 1, 1);
  d.setMonth(d.getMonth() + 1);
  return d;
};

/**
 * Due date = billing date (start of day, local calendar)
 */
const createDueDate = (year, month, billingDay) => {
  const lastDay = new Date(year, month, 0).getDate();
  const effectiveDay = Math.min(billingDay, lastDay);

  const d = new Date(year, month - 1, effectiveDay);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * MAIN RENT GENERATION (Approach B)
 */
const generateRentDue = async () => {
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const allocations = await AllocateUnit.find({
    status: "Active",
    startDate: { $lte: today },
  });

  for (const alloc of allocations) {
    const billingDay = alloc.billingDay;
    if (!billingDay || billingDay < 1) continue;

    const allocationStartMonth = formatMonth(alloc.startDate);

    let year, month;

    // Start from next pending month
    if (alloc.lastRentGeneratedMonth) {
      const [y, m] = alloc.lastRentGeneratedMonth.split("-").map(Number);
      const next = addMonth(y, m);
      year = next.getFullYear();
      month = next.getMonth() + 1;
    } else {
      year = alloc.startDate.getFullYear();
      month = alloc.startDate.getMonth() + 1;
    }

    while (true) {
      const dueDate = createDueDate(year, month, billingDay);
      const rentMonth = formatMonth(dueDate);

      // Never before allocation
      if (rentMonth < allocationStartMonth) {
        const next = addMonth(year, month);
        year = next.getFullYear();
        month = next.getMonth() + 1;
        continue;
      }

      // Billing day not reached yet → STOP
      if (dueDate > today) break;

      // Idempotency
      const exists = await RentDue.findOne({
        allocationId: alloc._id,
        month: rentMonth,
      });

      if (!exists) {
        await RentDue.create({
          adminId: alloc.adminId,
          allocationId: alloc._id,
          propertyId: alloc.propertyId,
          unitId: alloc.unitId,
          tenantId: alloc.tenantId,
          month: rentMonth,
          rentAmount: Number(alloc.rentAmount),
          dueDate, //billing date
          status: "Pending",
        });

        console.log(
          ` Rent generated | Allocation=${alloc._id} | Month=${rentMonth}`,
        );
      }

      alloc.lastRentGeneratedMonth = rentMonth;
      await alloc.save();

      const next = addMonth(year, month);
      year = next.getFullYear();
      month = next.getMonth() + 1;
    }
  }
};

module.exports = generateRentDue;
