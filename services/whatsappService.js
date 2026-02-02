const axios = require("axios");

const sendWhatsapp = async ({ phone, template, params }) => {
  try {
    const response = await axios.post(
      "https://api.gupshup.io/wa/api/v1/template/msg",
      {
        channel: "whatsapp",
        source: process.env.GUPSHUP_SOURCE,
        destination: phone,
        template: {
          id: template,
          params: params,
        },
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          apikey: process.env.GUPSHUP_API_KEY,
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error("WhatsApp Error:", error.response?.data);
    throw error;
  }
};

module.exports = { sendWhatsapp };
