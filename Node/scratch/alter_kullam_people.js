require("dotenv").config();
const { getConnectionWsinventoryPool } = require("../lib/connection");

getConnectionWsinventoryPool(async (err, client) => {
  if (err) {
    console.error("Connection error:", err);
    process.exit(1);
  }
  try {
    const [columns] = await client.query("DESCRIBE kullam_people");
    console.log("Current Columns in kullam_people:");
    console.table(columns);

    const existingColumns = columns.map(c => c.Field);

    const colsToAdd = [];
    if (!existingColumns.includes("vagaiyara")) {
      colsToAdd.push("ADD COLUMN vagaiyara VARCHAR(255) NULL");
    }
    if (!existingColumns.includes("entha_uru")) {
      colsToAdd.push("ADD COLUMN entha_uru VARCHAR(255) NULL");
    }
    if (!existingColumns.includes("district")) {
      colsToAdd.push("ADD COLUMN district VARCHAR(255) NULL");
    }
    if (!existingColumns.includes("pincode")) {
      colsToAdd.push("ADD COLUMN pincode VARCHAR(20) NULL");
    }
    if (!existingColumns.includes("vagaiyara_nickname")) {
      colsToAdd.push("ADD COLUMN vagaiyara_nickname VARCHAR(255) NULL");
    }

    if (colsToAdd.length > 0) {
      const alterQuery = `ALTER TABLE kullam_people ${colsToAdd.join(", ")}`;
      console.log("Executing:", alterQuery);
      await client.query(alterQuery);
      console.log("Table altered successfully!");

      const [newCols] = await client.query("DESCRIBE kullam_people");
      console.log("New Columns in kullam_people:");
      console.table(newCols);
    } else {
      console.log("All columns already exist.");
    }
  } catch (error) {
    console.error("Error altering table:", error);
  } finally {
    client.release();
    process.exit(0);
  }
});
