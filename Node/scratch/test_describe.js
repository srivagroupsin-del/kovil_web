require("dotenv").config();
const { getConnectionWsinventoryPool } = require("../lib/connection");

getConnectionWsinventoryPool(async (err, client) => {
  if (err) {
    console.error("Connection error:", err);
    process.exit(1);
  }
  try {
    const [finalTemple] = await client.query("DESCRIBE temple_details");
    console.log("Current columns in temple_details:");
    console.table(finalTemple.map(c => ({ Field: c.Field, Type: c.Type })));
  } catch (error) {
    console.error("Error:", error);
  } finally {
    client.release();
    process.exit(0);
  }
});
