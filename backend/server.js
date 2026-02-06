const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

dotenv.config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: [
    "http://localhost:5173", // Vite dev server
    process.env.FRONTEND_URL // production frontend URL if set
  ].filter(Boolean),
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));

// Middleware
app.use(express.json());

// Connect Database
connectDB();

// Test route
app.get("/health", (req, res) => {
  res.send("Backend is running");
});

// routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

app.use("/api/events", require("./routes/eventRoutes"));
app.use("/api/registrations", require("./routes/registrationRoutes"));
app.use("/api/profile", require("./routes/profileRoutes"));
app.use("/api/organizers", require("./routes/organizerRoutes"));
app.use("/api/organizer", require("./routes/organizerProfileRoutes")); // NEW

const errorHandler = require("./middleware/errorHandler");

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`http://localhost:5000`);
});

const authMiddleware = require("./middleware/authMiddleware");

app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({
    message: "Access granted",
    user: req.user
  });
});

app.use(errorHandler);

module.exports=app;

