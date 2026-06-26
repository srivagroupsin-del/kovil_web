require("dotenv").config();
const { getConnectionWsinventoryPool } = require("../lib/connection");

getConnectionWsinventoryPool(async (err, client) => {
  if (err) {
    console.error("Connection error:", err);
    process.exit(1);
  }
  try {
    // 1. Create moolavar_photos table if not exists
    console.log("Creating moolavar_photos table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS moolavar_photos (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        moolavar_id BIGINT NOT NULL,
        photo_path VARCHAR(255) NOT NULL,
        created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (moolavar_id) REFERENCES moolavar(id) ON DELETE CASCADE
      )
    `);
    console.log("moolavar_photos table created or verified successfully.");

    // 2. Read existing photos from moolavar table
    const [columns] = await client.query("DESCRIBE moolavar");
    const columnNames = columns.map(c => c.Field);

    if (columnNames.includes("photo")) {
      console.log("Reading existing photos from moolavar table...");
      const [rows] = await client.query("SELECT id, photo FROM moolavar");
      
      let totalMigrated = 0;
      for (const row of rows) {
        if (row.photo) {
          const photos = row.photo.split(",").map(p => p.trim()).filter(Boolean);
          for (const p of photos) {
            // Check if it already exists in the new table to prevent duplicates
            const [exist] = await client.query(
              "SELECT id FROM moolavar_photos WHERE moolavar_id = ? AND photo_path = ?",
              [row.id, p]
            );
            if (exist.length === 0) {
              await client.query(
                "INSERT INTO moolavar_photos (moolavar_id, photo_path) VALUES (?, ?)",
                [row.id, p]
              );
              totalMigrated++;
            }
          }
        }
      }
      console.log(`Successfully migrated ${totalMigrated} photos to moolavar_photos table.`);

      // 3. Drop photo column from moolavar table
      console.log("Dropping photo column from moolavar table...");
      await client.query("ALTER TABLE moolavar DROP COLUMN photo");
      console.log("photo column dropped successfully from moolavar!");
    } else {
      console.log("photo column already dropped or does not exist in moolavar table.");
    }

    // 4. Verify tables
    const [finalMoolavar] = await client.query("DESCRIBE moolavar");
    console.log("\nFinal columns in moolavar:");
    console.table(finalMoolavar.map(c => ({ Field: c.Field, Type: c.Type })));

    const [finalPhotos] = await client.query("DESCRIBE moolavar_photos");
    console.log("\nFinal columns in moolavar_photos:");
    console.table(finalPhotos.map(c => ({ Field: c.Field, Type: c.Type })));

    const [photosSample] = await client.query("SELECT * FROM moolavar_photos LIMIT 10");
    console.log("\nSample migrated data in moolavar_photos:");
    console.table(photosSample);

  } catch (error) {
    console.error("Error migrating photos:", error);
  } finally {
    client.release();
    process.exit(0);
  }
});
