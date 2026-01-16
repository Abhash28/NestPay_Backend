const RentDue = require("../model/RentDueSchema");

const updateOverdueRent = async () => {
  // Start of today (00:00:00 IST)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const result = await RentDue.updateMany(
    {
      status: "Pending",
      dueDate: { $lt: today },
    },
    {
      $set: { status: "Overdue" },
    }
  );

  console.log(`Marked ${result.modifiedCount} rent(s) as overdue`);
};

module.exports = updateOverdueRent;
