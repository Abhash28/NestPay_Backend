const cron = require("node-cron");
const generateRentDue = require("../services/generateRentDue");
const updateOverdueRent = require("../services/rentOverDue");

// Generate rent (daily)
cron.schedule(
  "* * * * *", // 12:01 AM IST
  generateRentDue,
  console.log("due rent working"),
  { timezone: "Asia/Kolkata" },
);

// Mark overdue (daily)
cron.schedule(
  "* * * * *", // 12:05 AM IST
  updateOverdueRent,
  console.log("overdue rent working"),
  { timezone: "Asia/Kolkata" },
);
