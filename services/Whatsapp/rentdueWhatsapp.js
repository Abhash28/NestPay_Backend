const RentDueSchema = require("../../model/RentDueSchema");
const { sendWhatsapp } = require("./whatsappService");

const RentdueWhatsapp = async () => {
  const today = new Date();

  const rentDues = await RentDueSchema.find({
    status: { $in: ["Pending", "Overdue"] },
  }).populate("tenantId", "tenantName tenantMobileNo");

  for (const rentDue of rentDues) {
    const dueDate = new Date(rentDue.dueDate);

    const month = dueDate.toLocaleString("en-IN", {
      month: "short",
      year: "numeric",
    });

    const formattedDueDate = dueDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    await sendWhatsapp({
      phone: rentDue.tenantId.tenantMobileNo,
      templateId: "b06f8dcf-738f-406c-975f-57b115db00ea",
      params: [
        rentDue.tenantId.tenantName,
        month,
        String(rentDue.rentAmount),
        formattedDueDate,
        "https://nest-pay.in",
      ],
    });
  }
};

module.exports = {
  RentdueWhatsapp,
};
