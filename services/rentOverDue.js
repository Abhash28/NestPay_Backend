const RentDue = require("../model/RentDueSchema");

const updateOverdueRent = async () => {
  const endOfYesterday = new Date();
  endOfYesterday.setHours(0, 0, 0, 0);
  endOfYesterday.setMilliseconds(-1); // 23:59:59.999 of yesterday

  const result = await RentDue.updateMany(
    {
      status: "Pending",
      dueDate: { $lte: endOfYesterday },
    },
    {
      $set: { status: "Overdue" },
    },
  );

  console.log(`Marked ${result.modifiedCount} rent(s) as overdue`);
};

module.exports = updateOverdueRent;
