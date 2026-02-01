const cron = require("node-cron");
const generateRentDue = require("../services/generateRentDue");
const updateOverdueRent = require("../services/rentOverDue");

// Generate rent (12:01 AM IST)
//cron.schedule(
//"* * * * *",
//async () => {
console.log("⏰ Running generateRentDue cron");
generateRentDue();
//},
//{
// timezone: "Asia/Kolkata",
//},
//);

// Mark overdue (12:05 AM IST)
//cron.schedule(
//"5 0 * * *",
//async () => {
//console.log("⏰ Running updateOverdueRent cron");
updateOverdueRent();
// },
//{
//timezone: "Asia/Kolkata",
//},
//);
