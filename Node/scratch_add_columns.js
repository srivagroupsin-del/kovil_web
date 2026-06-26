require("dotenv").config();
const { getConnectionWsinventoryPool } = require("./lib/connection");

getConnectionWsinventoryPool(async (err, client) => {
  if (err) {
    console.error("Connection error:", err);
    process.exit(1);
  }
  try {
    // 1. Check existing columns in temple_details
    const [columns] = await client.query("DESCRIBE temple_details");
    const columnNames = columns.map(c => c.Field);
    console.log("Existing columns:", columnNames);

    // 2. Add padal_padiyavar if it doesn't exist
    if (!columnNames.includes("padal_padiyavar")) {
      console.log("Adding padal_padiyavar column...");
      await client.query("ALTER TABLE temple_details ADD COLUMN padal_padiyavar VARCHAR(255) DEFAULT NULL");
      console.log("padal_padiyavar column added successfully!");
    } else {
      console.log("padal_padiyavar column already exists.");
    }

    // 3. Add entha_pathi if it doesn't exist
    if (!columnNames.includes("entha_pathi")) {
      console.log("Adding entha_pathi column...");
      await client.query("ALTER TABLE temple_details ADD COLUMN entha_pathi VARCHAR(255) DEFAULT NULL");
      console.log("entha_pathi column added successfully!");
    } else {
      console.log("entha_pathi column already exists.");
    }

    // 4. Print final columns
    const [finalColumns] = await client.query("DESCRIBE temple_details");
    console.log("Final columns in temple_details:");
    console.table(finalColumns);

  } catch (error) {
    console.error("Error modifying table:", error);
  } finally {
    client.release();
    process.exit(0);
  }
});
