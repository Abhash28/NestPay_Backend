const axios = require("axios");
const qs = require("qs");

const sendWhatsapp = async ({ phone, templateId, params }) => {
  const payload = qs.stringify({
    channel: "whatsapp",
    source: process.env.GUPSHUP_SOURCE,
    destination: phone,
    "src.name": "Nestpay",
    template: JSON.stringify({
      id: templateId,
      params: params.map(String),
    }),
  });

  const res = await axios.post(
    "https://api.gupshup.io/wa/api/v1/template/msg",
    payload,
    {
      headers: {
        apikey: process.env.GUPSHUP_API_KEY,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  );

  return res.data;
};

module.exports = { sendWhatsapp };
