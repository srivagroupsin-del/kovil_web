require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const { getConnectionWsinventoryPool } = require("../lib/connection");

getConnectionWsinventoryPool(async (err, client) => {
  if (err) {
    console.error("Connection error:", err);
    process.exit(1);
  }
  try {
    console.log("Checking columns in temple_theivankal...");
    const [columns] = await client.query("DESCRIBE temple_theivankal");
    const photoExists = columns.some(c => c.Field === "photo");

    if (!photoExists) {
      console.log("Adding photo column to temple_theivankal...");
      await client.query("ALTER TABLE temple_theivankal ADD COLUMN photo VARCHAR(255) DEFAULT NULL;");
      console.log("Column 'photo' added successfully.");
    } else {
      console.log("Column 'photo' already exists in temple_theivankal.");
    }

    // Verify final schema
    const [updatedColumns] = await client.query("DESCRIBE temple_theivankal");
    console.log("\nUpdated Columns in temple_theivankal:");
    console.table(updatedColumns.map(c => ({ Field: c.Field, Type: c.Type })));

  } catch (error) {
    console.error("Error running migration:", error);
  } finally {
    client.release();
    process.exit(0);
  }
});
