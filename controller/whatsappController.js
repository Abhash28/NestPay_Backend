const { sendWhatsapp } = require("../services/whatsappService");

const testWhatsapp = async (req, res, next) => {
  try {
    const response = await sendWhatsapp({
      phone: "917355947339",
      template: "rent_reminder",
    });
    res.status(200).json({
      success: true,
      message: "Whatsapp massage send successfully",
      response,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { testWhatsapp };
