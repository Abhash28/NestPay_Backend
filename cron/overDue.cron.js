const cron = require("node-cron");
const rentOverDue = require("../services/rentOverDue");
cron.schedule(
  "* * * * *",
  async () => {
    console.log("Rent Due cron started");
    try {
      await rentOverDue();
      console.log("rent over due genertae ");
    } catch (error) {
      console.log("rent over due failed", error);
    }
  },
  {
    timezone: "Asia/Kolkata",
  }
);
