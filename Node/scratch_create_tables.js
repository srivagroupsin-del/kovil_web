require("dotenv").config();
const { getConnectionWsinventoryPool } = require("./lib/connection");

const queries = [
  `CREATE TABLE IF NOT EXISTS moolavar_special_names (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      moolavar_id BIGINT NOT NULL,
      special_name VARCHAR(255) NOT NULL,
      created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (moolavar_id) REFERENCES moolavar(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS moolavar_deity_names (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      moolavar_id BIGINT NOT NULL,
      deity_name VARCHAR(255) NOT NULL,
      FOREIGN KEY (moolavar_id) REFERENCES moolavar(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS moolavar_worship_times (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      moolavar_id BIGINT NOT NULL,
      worship_time VARCHAR(255),
      FOREIGN KEY (moolavar_id) REFERENCES moolavar(id) ON DELETE CASCADE
  )`
];

getConnectionWsinventoryPool(async (err, client) => {
  if (err) {
    console.error("Connection error:", err);
    process.exit(1);
  }
  try {
    for (const query of queries) {
      console.log("Executing query...");
      await client.query(query);
      console.log("Query executed successfully!");
    }
  } catch (error) {
    console.error("Error creating tables:", error);
  } finally {
    client.release();
    process.exit(0);
  }
});
