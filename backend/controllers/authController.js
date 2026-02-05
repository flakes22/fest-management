const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const IIIT_DOMAINS = ["iiit.ac.in", "students.iiit.ac.in"];

exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, participantType, college, contactNumber, interests } = req.body;

    if (!firstName || !lastName || !email || !password || !participantType) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (!["IIIT", "Non-IIIT"].includes(participantType)) {
      return res.status(400).json({ message: "Invalid participantType" });
    }

    // IIIT email domain check
    if (participantType === "IIIT") {
      const domain = String(email).split("@")[1];
      if (!domain || !IIIT_DOMAINS.includes(domain)) {
        return res.status(400).json({ message: "Please use IIIT-issued email" });
      }
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: "participant",
      participantType,
      college,
      contactNumber,
      interests: Array.isArray(interests) ? interests : []
    });

    res.status(201).json({ message: "Registration successful", userId: user._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      role: user.role
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.changePassword = async (req, res) => {
  try {
    // Only participants can change their own password
    if (!req.user || req.user.role !== "participant") {
      return res.status(403).json({ message: "Forbidden" });
    }
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "currentPassword and newPassword are required" });
    }

    const user = await User.findById(req.user.userId).select("+password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(401).json({ message: "Current password is incorrect" });

    const hash = await bcrypt.hash(newPassword, 10);
    user.password = hash;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
