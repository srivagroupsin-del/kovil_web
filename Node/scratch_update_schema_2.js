require("dotenv").config();
const { getConnectionWsinventoryPool } = require("./lib/connection");

const queries = [
  `CREATE TABLE IF NOT EXISTS moolavar_divine_specialities (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      moolavar_id BIGINT NOT NULL,
      divine_speciality VARCHAR(255) NOT NULL,
      FOREIGN KEY (moolavar_id) REFERENCES moolavar(id) ON DELETE CASCADE
  )`,
  `DROP TABLE IF EXISTS moolavar_worship_times`
];

getConnectionWsinventoryPool(async (err, client) => {
  if (err) {
    console.error("Connection error:", err);
    process.exit(1);
  }
  try {
    for (const query of queries) {
      console.log(`Executing: ${query}`);
      await client.query(query);
      console.log("Query executed successfully!");
    }
  } catch (error) {
    console.error("Error updating tables:", error);
  } finally {
    client.release();
    process.exit(0);
  }
});
