require("dotenv").config();
const { getConnectionWsinventoryPool } = require("./lib/connection");

getConnectionWsinventoryPool(async (err, client) => {
  if (err) {
    console.error("Connection error:", err);
    process.exit(1);
  }
  try {
    const [rows] = await client.query("DESCRIBE moolavar");
    console.log("Columns in moolavar:");
    console.table(rows);
  } catch (error) {
    console.error("Error describing table:", error);
  } finally {
    client.release();
    process.exit(0);
  }
});
