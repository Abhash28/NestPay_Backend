const generateRentDue = require("../services/generateRentDue");
const updateOverdueRent = require("../services/rentOverDue");
const {
  sendRentDueNotifications,
} = require("../services/Notification/rentdue.service");

const runGenerateRent = async (req, res) => {
  await generateRentDue();
  res.json({ success: true, message: "Successfully Run Generate Rent" });
};

const runOverdueUpdate = async (req, res) => {
  await updateOverdueRent();
  res.json({ success: true, message: "Successfully Run update over-due Rent" });
};

const runRentDueNotify = async (req, res) => {
  await sendRentDueNotifications();
  res.json({
    success: true,
    message: "Successfully Run send rent due notification",
  });
};

module.exports = {
  runGenerateRent,
  runOverdueUpdate,
  runRentDueNotify,
};
