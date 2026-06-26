require("dotenv").config({ path: "../.env" });
const { getConnectionWsinventoryPool } = require("../lib/connection");

getConnectionWsinventoryPool(async (err, client) => {
  if (err) {
    console.error("Connection error:", err);
    process.exit(1);
  }
  try {
    const alterQuery = `
      ALTER TABLE community_selections
      ADD COLUMN tharpothaiya_vagaiyara VARCHAR(255) DEFAULT NULL AFTER vagaiyara_id
    `;
    console.log("Altering community_selections table...");
    await client.query(alterQuery);
    console.log("Column tharpothaiya_vagaiyara added successfully!");
  } catch (error) {
    console.error("Error altering table:", error);
  } finally {
    client.release();
    process.exit(0);
  }
});
