require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rentDueCron = require("./cron/rentDue.cron");
const dbConnect = require("./config/dbConnect");
const { loginRouter } = require("./routers/loginRouter");
const { propertyRouter } = require("./routers/PropertyRouter");
const { tenantRoute } = require("./routers/TenantRouter");
const { allocatUnitRouter } = require("./routers/AllocationRouter");
const { rentDueRouter } = require("./routers/RentdueRouter");
const { paymentRouter } = require("./routers/PaymentRouter");
const { UnitRouter } = require("./routers/UnitRouter");
const { adminProfileRouter } = require("./routers/AdminProfileRouter");

const app = express();

/* 🔥 REQUIRED FOR RENDER */
app.set("trust proxy", 1);

/* 🔥 BODY PARSERS */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* 🔥 FINAL CORS CONFIG */
const allowedOrigins = ["https://nest-pay.in", "http://localhost:5173"];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow REST tools, server-to-server, and same-origin
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

/* 🔥 HANDLE PREFLIGHT */
app.options("*", cors());

/* DB CONNECT */
dbConnect();

/* ROUTES */
app.use("/api/auth", loginRouter);
app.use("/api/property", propertyRouter);
app.use("/api/unit", UnitRouter);
app.use("/api/tenant", tenantRoute);
app.use("/api/allocation", allocatUnitRouter);
app.use("/api/rentDue", rentDueRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/admin", adminProfileRouter);

/* HEALTH CHECK */
app.get("/", (req, res) => {
  res.send("NestPay Backend Running successfully 🚀");
});

/* GLOBAL ERROR HANDLER */
app.use((err, req, res, next) => {
  const statusCode = err.status || 500;
  const message = err.message || "Global error occurred";
  res.status(statusCode).json({
    success: false,
    message,
  });
});

/* START SERVER */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
