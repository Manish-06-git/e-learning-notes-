const mysql = require("mysql2/promise");

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",   // XAMPP default
  database: "elearn_notes"
});

module.exports = db;
