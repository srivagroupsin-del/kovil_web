require("dotenv").config();
const { getConnectionWsinventoryPool } = require("../lib/connection");

const columnsToAdd = [
  { name: "community_id", type: "INT DEFAULT NULL" },
  { name: "sub_community_id", type: "INT DEFAULT NULL" },
  { name: "kula_id", type: "INT DEFAULT NULL" },
  { name: "kula_deivam_id", type: "INT DEFAULT NULL" },
  { name: "vagaiyara_id", type: "INT DEFAULT NULL" },
  { name: "tharpothaiya_vagaiyara", type: "VARCHAR(255) DEFAULT NULL" },
  { name: "generation_no", type: "INT DEFAULT NULL" },
  { name: "marital_status", type: "VARCHAR(50) DEFAULT 'unmarried'" },
  { name: "spouse_name", type: "VARCHAR(255) DEFAULT NULL" },
  { name: "spouse_kula_deivam_id", type: "INT DEFAULT NULL" }
];

getConnectionWsinventoryPool(async (err, client) => {
  if (err) {
    console.error("Connection error:", err);
    process.exit(1);
  }
  try {
    const [columns] = await client.query("DESCRIBE temple_details");
    const existingColumns = columns.map(c => c.Field);

    for (const col of columnsToAdd) {
      if (!existingColumns.includes(col.name)) {
        console.log(`Adding column ${col.name}...`);
        await client.query(`ALTER TABLE temple_details ADD COLUMN ${col.name} ${col.type}`);
        console.log(`Column ${col.name} added successfully!`);
      } else {
        console.log(`Column ${col.name} already exists.`);
      }
    }
  } catch (error) {
    console.error("Error migrating columns:", error);
  } finally {
    client.release();
    process.exit(0);
  }
});
