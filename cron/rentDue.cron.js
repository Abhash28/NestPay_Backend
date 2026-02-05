const cron = require("node-cron");
const mongoose = require("mongoose");
const {
  sendRentDueNotifications,
} = require("../services/Notification/rentdue.service");
const generateRentDue = require("../services/generateRentDue");
const updateOverdueRent = require("../services/rentOverDue");

/**
 * ================= START CRONS =================
 * Start ONLY after DB is connected
 */
function startCrons() {
  console.log(" Cron scheduler started");

  // ================= RENT GENERATION =================
  // Runs at 12:10 AM IST (SAFE TIME)
  cron.schedule(
    "* * * * *",
    async () => {
      try {
        console.log(" [CRON] Running generateRentDue");
        await generateRentDue();
        console.log(" [CRON] generateRentDue completed");
      } catch (error) {
        console.error(" [CRON] generateRentDue error:", error);
      }
    },
    { timezone: "Asia/Kolkata" },
  );

  // ================= OVERDUE MARKING =================
  // Runs at 12:15 AM IST
  cron.schedule(
    "* * * * *",
    async () => {
      try {
        console.log(" [CRON] Running updateOverdueRent");
        await updateOverdueRent();
        console.log(" [CRON] updateOverdueRent completed");
      } catch (error) {
        console.error(" [CRON] updateOverdueRent error:", error);
      }
    },
    { timezone: "Asia/Kolkata" },
  );
}

/**
 * ================= RECOVERY RUN =================
 * Runs ONCE after server restart
 * Fixes missed cron executions
 */
async function recoveryRun() {
  try {
    console.log(" [RECOVERY] Checking missed rent generation");
    await generateRentDue();
    console.log("[RECOVERY] generateRentDue completed");
  } catch (error) {
    console.error("[RECOVERY] generateRentDue error:", error);
  }
}

/**
 * ================= BOOTSTRAP =================
 */
mongoose.connection.once("open", () => {
  console.log(" MongoDB connected");

  // Start cron jobs
  startCrons();

  // Run recovery after 1 minute (server stabilization)
  setTimeout(recoveryRun, 60_000);
});

// ⏰ Every day at 9 AM
cron.schedule("* * * * *", async () => {
  console.log("⏰ Running rent due notification cron");
  await sendRentDueNotifications();
});
