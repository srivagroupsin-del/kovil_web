require("dotenv").config();
const { getConnectionWsinventoryPool } = require("../lib/connection");

getConnectionWsinventoryPool(async (err, client) => {
  if (err) {
    console.error("Connection error:", err);
    process.exit(1);
  }
  try {
    // 1. Create temple_mandapams table if not exists
    console.log("Creating temple_mandapams table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS temple_mandapams (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        temple_details_id BIGINT NOT NULL,
        mandapam_name VARCHAR(255) NOT NULL,
        created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (temple_details_id) REFERENCES temple_details(id) ON DELETE CASCADE
      )
    `);
    console.log("temple_mandapams table created or verified successfully.");

    // 2. Read existing mandapams from temple_details table
    const [columns] = await client.query("DESCRIBE temple_details");
    const columnNames = columns.map(c => c.Field);

    if (columnNames.includes("mandapams")) {
      console.log("Reading existing mandapams from temple_details table...");
      const [rows] = await client.query("SELECT id, mandapams FROM temple_details");
      
      let totalMigrated = 0;
      for (const row of rows) {
        if (row.mandapams) {
          const mandapams = row.mandapams.split(",").map(m => m.trim()).filter(Boolean);
          for (const m of mandapams) {
            // Check if it already exists to prevent duplicate insertion on rerun
            const [exist] = await client.query(
              "SELECT id FROM temple_mandapams WHERE temple_details_id = ? AND mandapam_name = ?",
              [row.id, m]
            );
            if (exist.length === 0) {
              await client.query(
                "INSERT INTO temple_mandapams (temple_details_id, mandapam_name) VALUES (?, ?)",
                [row.id, m]
              );
              totalMigrated++;
            }
          }
        }
      }
      console.log(`Successfully migrated ${totalMigrated} mandapams to temple_mandapams table.`);

      // 3. Drop mandapams column from temple_details table
      console.log("Dropping mandapams column from temple_details table...");
      await client.query("ALTER TABLE temple_details DROP COLUMN mandapams");
      console.log("mandapams column dropped successfully from temple_details!");
    } else {
      console.log("mandapams column already dropped or does not exist in temple_details table.");
    }

    // 4. Verify tables
    const [finalTemple] = await client.query("DESCRIBE temple_details");
    console.log("\nFinal columns in temple_details:");
    console.table(finalTemple.map(c => ({ Field: c.Field, Type: c.Type })));

    const [finalMandapams] = await client.query("DESCRIBE temple_mandapams");
    console.log("\nFinal columns in temple_mandapams:");
    console.table(finalMandapams.map(c => ({ Field: c.Field, Type: c.Type })));

    const [mandapamsSample] = await client.query("SELECT * FROM temple_mandapams LIMIT 10");
    console.log("\nSample migrated data in temple_mandapams:");
    console.table(mandapamsSample);

  } catch (error) {
    console.error("Error migrating mandapams:", error);
  } finally {
    client.release();
    process.exit(0);
  }
});
