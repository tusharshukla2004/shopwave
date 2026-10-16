const jwt = require("jsonwebtoken");
const db = require("../config/db");

const protect = async (req, res, next) => {
  const authorization = req.headers.authorization || "";
  const match = authorization.match(/^Bearer\s+(\S+)$/i);
  if (!match) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token",
    });
  }

  try {
    const decoded = jwt.verify(match[1], process.env.JWT_SECRET);
    const [users] = await db.query(
      "SELECT id, role FROM users WHERE id=?",
      [decoded.id],
    );
    if (!users.length) {
      return res.status(401).json({
        success: false,
        message: "User account is no longer available",
      });
    }

    req.user = { ...decoded, id: users[0].id, role: users[0].role };
    return next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token invalid",
      });
    }
    console.error("Failed to authenticate request:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to authenticate request",
    });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "You are not authorized to access this resource",
    });
  }
  return next();
};

module.exports = { protect, authorize };