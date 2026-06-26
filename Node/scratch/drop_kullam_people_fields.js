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

    const colsToDrop = [];
    if (existingColumns.includes("name")) colsToDrop.push("DROP COLUMN name");
    if (existingColumns.includes("kullam")) colsToDrop.push("DROP COLUMN kullam");
    if (existingColumns.includes("temple")) colsToDrop.push("DROP COLUMN temple");
    if (existingColumns.includes("address")) colsToDrop.push("DROP COLUMN address");

    if (colsToDrop.length > 0) {
      const alterQuery = `ALTER TABLE kullam_people ${colsToDrop.join(", ")}`;
      console.log("Executing:", alterQuery);
      await client.query(alterQuery);
      console.log("Table altered successfully!");

      const [newCols] = await client.query("DESCRIBE kullam_people");
      console.log("New Columns in kullam_people:");
      console.table(newCols);
    } else {
      console.log("Columns already removed.");
    }
  } catch (error) {
    console.error("Error altering table:", error);
  } finally {
    client.release();
    process.exit(0);
  }
});
