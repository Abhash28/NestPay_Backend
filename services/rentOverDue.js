const RentDue = require("../model/RentDueSchema");

const updateOverdueRent = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const graceDays = 5;

  const overdueCutoff = new Date(today);
  overdueCutoff.setDate(overdueCutoff.getDate() - graceDays);

  const result = await RentDue.updateMany(
    {
      status: "Pending",
      dueDate: { $lt: overdueCutoff },
    },
    {
      $set: { status: "Overdue" },
    },
  );

  console.log(`Marked ${result.modifiedCount} rents as overdue`);
};

module.exports = updateOverdueRent;
