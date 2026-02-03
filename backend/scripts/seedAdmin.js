const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/user");

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const adminEmail = process.env.ADMIN_EMAIL || "admin@felicity.local";
    const adminPassword = process.env.ADMIN_PASSWORD || "ChangeMe123!";
    let admin = await User.findOne({ email: adminEmail, role: "admin" });
    if (!admin) {
      const hash = await bcrypt.hash(adminPassword, 10);
      admin = await User.create({
        firstName: "System",
        lastName: "Admin",
        email: adminEmail,
        password: hash,
        role: "admin"
      });
      console.log("Admin created:", adminEmail);
    } else {
      console.log("Admin exists:", adminEmail);
    }
    await mongoose.disconnect();
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();