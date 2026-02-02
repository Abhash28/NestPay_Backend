const cron = require("node-cron");
const generateRentDue = require("../services/generateRentDue");
const updateOverdueRent = require("../services/rentOverDue");

// ================= RENT GENERATION =================
// Runs at 12:01 AM IST every day
cron.schedule(
  "1 0 * * *",
  async () => {
    try {
      console.log("⏰ Running generateRentDue cron");
      await generateRentDue();
      console.log("✅ generateRentDue completed");
    } catch (error) {
      console.error("❌ generateRentDue error:", error);
    }
  },
  {
    timezone: "Asia/Kolkata",
  },
);

// ================= OVERDUE MARKING =================
// Runs at 12:05 AM IST every day
cron.schedule(
  "5 0 * * *",
  async () => {
    try {
      console.log("⏰ Running updateOverdueRent cron");
      await updateOverdueRent(); // ✅ FIXED
      console.log("✅ updateOverdueRent completed");
    } catch (error) {
      console.error("❌ updateOverdueRent error:", error);
    }
  },
  {
    timezone: "Asia/Kolkata",
  },
);
