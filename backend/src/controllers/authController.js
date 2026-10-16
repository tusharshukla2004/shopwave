const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTER
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    const normalizedName = typeof name === "string" ? name.trim() : "";
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const passwordBytes = typeof password === "string"
      ? Buffer.byteLength(password, "utf8")
      : 0;

    if (
      !normalizedName ||
      normalizedName.length > 150 ||
      normalizedEmail.length > 255 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) ||
      passwordBytes < 8 ||
      passwordBytes > 72
    ) {
      return res.status(400).json({
        success: false,
        message: "Provide a valid name and email, and a password between 8 and 72 bytes",
      });
    }

    const [existingUser] = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [normalizedEmail]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users(name,email,password,role) VALUES (?,?,?,?)",
      [normalizedName, normalizedEmail, hashedPassword, "CUSTOMER"]
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
    });

  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (
      !normalizedEmail ||
      typeof password !== "string" ||
      !password ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid email and password are required",
      });
    }

    const [users] = await db.query(
      "SELECT * FROM users WHERE email=?",
      [normalizedEmail]
    );

    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const getProfile = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
};