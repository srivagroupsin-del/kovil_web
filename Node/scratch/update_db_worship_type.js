require("dotenv").config();
const { getConnectionWsinventoryPool } = require("../lib/connection");

getConnectionWsinventoryPool(async (err, client) => {
  if (err) {
    console.error("Connection error:", err);
    process.exit(1);
  }
  try {
    // 1. Check moolavar table columns
    const [moolavarCols] = await client.query("DESCRIBE moolavar");
    const moolavarColNames = moolavarCols.map(c => c.Field);
    console.log("Existing columns in moolavar:", moolavarColNames);

    if (moolavarColNames.includes("worship_type")) {
      console.log("Dropping worship_type column from moolavar table...");
      await client.query("ALTER TABLE moolavar DROP COLUMN worship_type");
      console.log("worship_type column dropped successfully from moolavar!");
    } else {
      console.log("worship_type column does not exist in moolavar table.");
    }

    // 2. Check temple_details table columns
    const [templeCols] = await client.query("DESCRIBE temple_details");
    const templeColNames = templeCols.map(c => c.Field);
    console.log("Existing columns in temple_details:", templeColNames);

    if (!templeColNames.includes("worship_type")) {
      console.log("Adding worship_type column to temple_details table...");
      await client.query("ALTER TABLE temple_details ADD COLUMN worship_type VARCHAR(255) DEFAULT NULL");
      console.log("worship_type column added successfully to temple_details!");
    } else {
      console.log("worship_type column already exists in temple_details table.");
    }

    // 3. Print final states
    const [finalMoolavar] = await client.query("DESCRIBE moolavar");
    console.log("\nFinal columns in moolavar:");
    console.table(finalMoolavar.map(c => ({ Field: c.Field, Type: c.Type })));

    const [finalTemple] = await client.query("DESCRIBE temple_details");
    console.log("\nFinal columns in temple_details:");
    console.table(finalTemple.map(c => ({ Field: c.Field, Type: c.Type })));

  } catch (error) {
    console.error("Error updating schema:", error);
  } finally {
    client.release();
    process.exit(0);
  }
});
