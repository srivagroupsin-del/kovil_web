require("dotenv").config();
const { getConnectionWsinventoryPool } = require("./lib/connection");

getConnectionWsinventoryPool(async (err, client) => {
  if (err) {
    console.error("Connection error:", err);
    process.exit(1);
  }
  try {
    // 1. Create the child table if it doesn't exist
    console.log("Creating porulatar_items table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS porulatar_items (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        porulatar_id BIGINT NOT NULL,
        item_name VARCHAR(255) NOT NULL,
        CONSTRAINT fk_porulatar_items
          FOREIGN KEY (porulatar_id)
          REFERENCES porulatar(id)
          ON DELETE CASCADE
      )
    `);
    console.log("porulatar_items table verified/created.");

    // 2. Check if 'item_name' exists in 'porulatar'
    const [columns] = await client.query("DESCRIBE porulatar");
    const columnNames = columns.map(c => c.Field);
    console.log("Existing columns in porulatar:", columnNames);

    if (columnNames.includes("item_name")) {
      console.log("Migrating existing item data to porulatar_items...");
      
      // Fetch all records with a non-null/non-empty item_name
      const [rows] = await client.query("SELECT id, item_name FROM porulatar WHERE item_name IS NOT NULL AND item_name <> ''");
      console.log(`Found ${rows.length} records to migrate.`);
      
      for (const row of rows) {
        // Just in case it's a comma-separated list or simple string
        // We'll split by comma to handle multiple items if they were saved like that, or just insert as-is
        const items = row.item_name.split(",").map(i => i.trim()).filter(Boolean);
        for (const item of items) {
          await client.query("INSERT INTO porulatar_items (porulatar_id, item_name) VALUES (?, ?)", [row.id, item]);
        }
      }
      console.log("Data migration complete.");

      // 3. Drop the column
      console.log("Dropping column 'item_name' from porulatar...");
      await client.query("ALTER TABLE porulatar DROP COLUMN item_name");
      console.log("Column 'item_name' dropped successfully.");
    } else {
      console.log("Column 'item_name' already dropped/does not exist.");
    }

    console.log("Migration finished successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    client.release();
    process.exit(0);
  }
});
