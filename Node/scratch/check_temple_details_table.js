require("dotenv").config();
const { getConnectionWsinventoryPool } = require("../lib/connection");

getConnectionWsinventoryPool(async (err, client) => {
  if (err) {
    console.error("Connection error:", err);
    process.exit(1);
  }
  try {
    const [columns] = await client.query("DESCRIBE temple_details");
    console.log("Columns in temple_details:");
    console.table(columns);
  } catch (error) {
    console.error("Error detailing table:", error);
  } finally {
    client.release();
    process.exit(0);
  }
});
