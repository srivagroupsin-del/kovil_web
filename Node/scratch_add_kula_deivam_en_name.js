require("dotenv").config();
const { getConnectionWsinventoryPool } = require("./lib/connection");

const query = "ALTER TABLE community_kula_deivam ADD COLUMN kula_deivam_name_en VARCHAR(255) DEFAULT NULL AFTER kula_deivam_name";

getConnectionWsinventoryPool(async (err, client) => {
  if (err) {
    console.error("Connection error:", err);
    process.exit(1);
  }
  try {
    console.log(`Executing: ${query}`);
    await client.query(query);
    console.log("Executed successfully!");
  } catch (error) {
    if (error.message.includes("Duplicate column name")) {
      console.log("Column already exists, skipping...");
    } else {
      console.error("Error altering table:", error);
    }
  } finally {
    client.release();
    process.exit(0);
  }
});
