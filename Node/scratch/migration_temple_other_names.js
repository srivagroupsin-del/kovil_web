require("dotenv").config();
const { getConnectionWsinventoryPool } = require("../lib/connection");

getConnectionWsinventoryPool(async (err, client) => {
  if (err) {
    console.error("Connection error:", err);
    process.exit(1);
  }
  try {
    // 1. Create temple_other_names table if not exists
    console.log("Creating temple_other_names table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS temple_other_names (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        temple_details_id BIGINT NOT NULL,
        other_name VARCHAR(255) NOT NULL,
        created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_temple_other_names FOREIGN KEY (temple_details_id) REFERENCES temple_details(id) ON DELETE CASCADE
      )
    `);
    console.log("temple_other_names table created or verified successfully.");

    // 2. Read existing other_names from temple_details table
    const [columns] = await client.query("DESCRIBE temple_details");
    const columnNames = columns.map(c => c.Field);

    if (columnNames.includes("other_names")) {
      console.log("Reading existing other_names from temple_details table...");
      const [rows] = await client.query("SELECT id, other_names FROM temple_details");
      
      let totalMigrated = 0;
      for (const row of rows) {
        if (row.other_names) {
          const otherNames = row.other_names.split(",").map(n => n.trim()).filter(Boolean);
          for (const n of otherNames) {
            // Check if it already exists to prevent duplicate insertion on rerun
            const [exist] = await client.query(
              "SELECT id FROM temple_other_names WHERE temple_details_id = ? AND other_name = ?",
              [row.id, n]
            );
            if (exist.length === 0) {
              await client.query(
                "INSERT INTO temple_other_names (temple_details_id, other_name) VALUES (?, ?)",
                [row.id, n]
              );
              totalMigrated++;
            }
          }
        }
      }
      console.log(`Successfully migrated ${totalMigrated} other names to temple_other_names table.`);

      // 3. Drop other_names column from temple_details table
      console.log("Dropping other_names column from temple_details table...");
      await client.query("ALTER TABLE temple_details DROP COLUMN other_names");
      console.log("other_names column dropped successfully from temple_details!");
    } else {
      console.log("other_names column already dropped or does not exist in temple_details table.");
    }

    // 4. Verify tables
    const [finalTemple] = await client.query("DESCRIBE temple_details");
    console.log("\nFinal columns in temple_details:");
    console.table(finalTemple.map(c => ({ Field: c.Field, Type: c.Type })));

    const [finalOtherNames] = await client.query("DESCRIBE temple_other_names");
    console.log("\nFinal columns in temple_other_names:");
    console.table(finalOtherNames.map(c => ({ Field: c.Field, Type: c.Type })));

    const [otherNamesSample] = await client.query("SELECT * FROM temple_other_names LIMIT 10");
    console.log("\nSample migrated data in temple_other_names:");
    console.table(otherNamesSample);

  } catch (error) {
    console.error("Error migrating other names:", error);
  } finally {
    client.release();
    process.exit(0);
  }
});
