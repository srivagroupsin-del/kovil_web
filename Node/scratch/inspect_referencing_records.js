require('dotenv').config();
const { getConnectionWsinventoryPool } = require("../lib/connection");

getConnectionWsinventoryPool(async (err, client) => {
  if (err) {
    console.error("DB connection error:", err);
    process.exit(1);
  }
  try {
    const idToDelete = 6;
    console.log(`Inspecting records for vagaiyara_id = ${idToDelete}...`);

    const [families] = await client.query("SELECT * FROM families WHERE vagaiyara_id = ?", [idToDelete]);
    console.log("Referencing Families:", families);

    const [selections] = await client.query("SELECT * FROM community_selections WHERE vagaiyara_id = ?", [idToDelete]);
    console.log("Referencing Community Selections:", selections);

  } catch (error) {
    console.error("Error inspecting records:", error);
  } finally {
    client.release();
    process.exit(0);
  }
});
