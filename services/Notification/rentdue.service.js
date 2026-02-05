const RentDue = require("../../model/RentDueSchema");
const FcmToken = require("../../model/FcmTokenSchema");
const { pushNotification } = require("./pushNotification");

const sendRentDueNotifications = async () => {
  const today = new Date();

  const dues = await RentDue.find({
    status: { $in: ["Pending", "Overdue"] },
    dueDate: { $lte: today },
  }).populate("tenantId unitId");

  for (const due of dues) {
    const tokens = await FcmToken.find({
      ownerType: "tenant",
      ownerId: due.tenantId._id,
      isActive: true,
    });

    if (!tokens.length) continue;

    const title =
      due.status === "Overdue" ? "🚨 Rent Overdue" : "⏰ Rent Pending";

    const body = `₹${due.rentAmount} rent for ${due.unitId.unitName} is ${due.status.toLowerCase()}.`;

    await pushNotification(
      tokens.map((t) => t.token),
      title,
      body,
      "https://nest-pay.in",
    );
  }
};

module.exports = { sendRentDueNotifications };
