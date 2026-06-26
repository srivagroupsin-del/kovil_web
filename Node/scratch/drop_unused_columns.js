require("dotenv").config();
const { getConnectionWsinventoryPool } = require("../lib/connection");

getConnectionWsinventoryPool(async (err, client) => {
  if (err) {
    console.error("Connection error:", err);
    process.exit(1);
  }
  try {
    console.log("Dropping song_by and song_section columns from temple_details...");
    await client.query(`
      ALTER TABLE temple_details
      DROP COLUMN song_by,
      DROP COLUMN song_section
    `);
    console.log("Columns dropped successfully!");

    // Verify
    const [finalTemple] = await client.query("DESCRIBE temple_details");
    console.log("\nFinal columns in temple_details:");
    console.table(finalTemple.map(c => ({ Field: c.Field, Type: c.Type })));

  } catch (error) {
    console.error("Error executing ALTER TABLE:", error);
  } finally {
    client.release();
    process.exit(0);
  }
});
