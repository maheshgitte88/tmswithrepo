const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

// Secret key for JWT signing
const JWT_SECRET = "maheshgitte88";

// Login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({
      where: {
        user_Email: email,
        user_Password: password,
        user_status: "Active", // Ensure user status is active
      },
    });

    if (user) {
      // Create JWT token with user payload and expiration time
      const token = jwt.sign(
        {
          user_id: user.user_id,
          user_Name: user.user_Name,
          user_Email: user.user_Email,
          user_Mobile: user.user_Mobile,
          user_Roal: user.user_Roal,
          user_reg_no: user.user_reg_no,
          user_status: user.user_status,
          DepartmentID: user.DepartmentID,
          SubDepartmentID: user.SubDepartmentID,
          // Include other necessary user details
        },
        process.env.JWT_SECRET || "maheshgitte88",
        { expiresIn: "8h" }
      );
      res.json({ success: true, token });
    } else {
      res.status(401).json({ success: false, message: "Invalid email or password" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Signup route
router.post("/signup", async (req, res) => {
  const { name, email, password, role, reg_no, location, mobile, status } = req.body;
  try {
    await User.create({
      user_Name: name,
      user_Email: email,
      user_Password: password,
      user_Roal: role,
      user_reg_no: reg_no,
      user_Mobile: mobile,
      location: location,
      user_status: status
    });
    res.json({ success: true, message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
