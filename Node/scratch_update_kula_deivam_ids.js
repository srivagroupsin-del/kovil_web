require("dotenv").config();
const { getConnectionWsinventoryPool } = require("./lib/connection");

const queries = [
  "ALTER TABLE community_kula_deivam ADD COLUMN community_id INT DEFAULT NULL AFTER id",
  "ALTER TABLE community_kula_deivam ADD COLUMN sub_community_id INT DEFAULT NULL AFTER community_id",
  "ALTER TABLE community_kula_deivam ADD COLUMN kula_id INT DEFAULT NULL AFTER sub_community_id"
];

getConnectionWsinventoryPool(async (err, client) => {
  if (err) {
    console.error("Connection error:", err);
    process.exit(1);
  }
  try {
    for (const query of queries) {
      console.log(`Executing: ${query}`);
      try {
        await client.query(query);
        console.log("Executed successfully!");
      } catch (err) {
        if (err.message.includes("Duplicate column name")) {
          console.log("Column already exists, skipping...");
        } else {
          throw err;
        }
      }
    }
  } catch (error) {
    console.error("Error altering tables:", error);
  } finally {
    client.release();
    process.exit(0);
  }
});
