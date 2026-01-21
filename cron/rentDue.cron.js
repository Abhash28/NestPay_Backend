const cron = require("node-cron");
const generateRentDue = require("../services/generateRentDue");
const updateOverdueRent = require("../services/rentOverDue");

// Generate rent (daily)
cron.schedule(
  "* * * * *", // 12:01 AM IST
  generateRentDue,
  { timezone: "Asia/Kolkata" },
);

// Mark overdue (daily)
cron.schedule(
  "* * * * *", // 12:05 AM IST
  updateOverdueRent,
  { timezone: "Asia/Kolkata" },
);
