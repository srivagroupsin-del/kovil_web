require("dotenv").config();
const { getConnectionWsinventoryPool } = require("../lib/connection");

getConnectionWsinventoryPool(async (err, client) => {
  if (err) {
    console.error("Connection error:", err);
    process.exit(1);
  }
  try {
    const [columns] = await client.query("DESCRIBE kullam_people");
    const existingColumns = columns.map(c => c.Field);

    if (existingColumns.includes("phone")) {
      const alterQuery = `ALTER TABLE kullam_people DROP COLUMN phone`;
      console.log("Executing:", alterQuery);
      await client.query(alterQuery);
      console.log("Table altered successfully!");

      const [newCols] = await client.query("DESCRIBE kullam_people");
      console.log("New Columns in kullam_people:");
      console.table(newCols);
    } else {
      console.log("Phone column already removed.");
    }
  } catch (error) {
    console.error("Error altering table:", error);
  } finally {
    client.release();
    process.exit(0);
  }
});
