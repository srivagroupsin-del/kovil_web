const mysql = require("mysql2/promise");
const winston = require("winston");
const { databaseConfig } = require("../config");

const wsinventoryConfig = databaseConfig.wsinventory;
const wsinventoryHost = wsinventoryConfig.host;
const wsinventoryUser = wsinventoryConfig.user;
const wsinventoryPassword = wsinventoryConfig.password;
const wsinventoryDatabase = wsinventoryConfig.database;
const wsinventoryPort = parseInt(wsinventoryConfig.port, 10);

const wsinventoryPool = mysql.createPool({
  host: wsinventoryHost,
  user: wsinventoryUser,
  password: wsinventoryPassword,
  database: wsinventoryDatabase,
  port: wsinventoryPort,
  connectionLimit: 50,
  idleTimeout: 30000,
  connectTimeout: 5000,
  waitForConnections: true,
  queueLimit: 0
});

const getConnectionWsinventoryPool = async function (callback) {
  try {
    const client = await wsinventoryPool.getConnection();
    try {
      await client.query("SET wait_timeout = 15"); 
    } catch (timeoutErr) {
      winston.error("Failed to set wait_timeout", timeoutErr);
    }
    winston.info("Database connection established successfully");
    callback(null, client);
  } catch (err) {
    winston.error("Error connecting to the database", err);
    callback(err, null);
  }
};

module.exports = {
  getConnectionWsinventoryPool,
  pool: wsinventoryPool 
};