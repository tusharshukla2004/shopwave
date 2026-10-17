
const mysql = require("mysql2");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const requiredConfig = ["DB_HOST", "DB_USER", "DB_NAME"];
const missingConfig = requiredConfig.filter((key) => !process.env[key]);

if (missingConfig.length > 0) {
  throw new Error(
    `Missing required MySQL configuration: ${missingConfig.join(", ")}`
  );
}

const caPath = path.join(__dirname, "ca.pem");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: Number(process.env.DB_PORT || 3306),
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME,

  ssl: {
    ca: fs.readFileSync(caPath, "utf8"),
    rejectUnauthorized: true,
  },

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool.promise();
