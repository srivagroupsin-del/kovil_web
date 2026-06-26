require("dotenv").config();
const { getConnectionWsinventoryPool } = require("../lib/connection");

getConnectionWsinventoryPool(async (err, client) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  try {
    const [columns] = await client.query("DESCRIBE user_communities");
    console.log("user_communities columns:", columns);
  } catch (dbErr) {
    console.error(dbErr);
  } finally {
    client.release();
    process.exit(0);
  }
});
