require("dotenv").config();
const { getConnectionWsinventoryPool } = require("../lib/connection");

getConnectionWsinventoryPool(async (err, client) => {
  if (err) {
    console.error("Connection error:", err);
    process.exit(1);
  }
  try {
    console.log("Creating temple_theivankal table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS temple_theivankal (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        temple_details_id BIGINT NOT NULL,
        deivam VARCHAR(255) NOT NULL,
        thesai VARCHAR(255) NOT NULL,
        created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (temple_details_id) REFERENCES temple_details(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);
    console.log("temple_theivankal table created or verified successfully.");

    // Verify
    const [columns] = await client.query("DESCRIBE temple_theivankal");
    console.log("\nColumns in temple_theivankal:");
    console.table(columns.map(c => ({ Field: c.Field, Type: c.Type })));

  } catch (error) {
    console.error("Error creating table:", error);
  } finally {
    client.release();
    process.exit(0);
  }
});
