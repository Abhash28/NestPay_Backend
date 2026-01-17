const cron = require("node-cron");
const generateRentDue = require("../services/generateRentDue");

// Runs every day at 12:01 AM
cron.schedule(
  "* * * * *",
  async () => {
    console.log("Rent Due Cron Started");
    try {
      await generateRentDue();
      console.log(" Rent Due Generation Completed");
    } catch (error) {
      console.error("Rent Due Cron Failed", error);
    }
  },
  {
    timezone: "Asia/Kolkata",
  }
);
