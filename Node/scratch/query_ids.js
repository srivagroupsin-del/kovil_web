require("dotenv").config();
const { getConnectionWsinventoryPool } = require("../lib/connection");

getConnectionWsinventoryPool(async (err, client) => {
  if (err) {
    console.error("Connection error:", err);
    process.exit(1);
  }
  try {
    const [comms] = await client.query("SELECT id, community_name_english FROM communities WHERE community_name_english LIKE '%Nadar%'");
    console.log("Communities:", comms);

    const [subs] = await client.query("SELECT id, sub_community_name_english FROM sub_communities WHERE sub_community_name_english LIKE '%Karupambadi%'");
    console.log("Sub-Communities:", subs);

    const [kulas] = await client.query("SELECT id, kula_name_english FROM kulas WHERE kula_name_english LIKE '%Ponnar%'");
    console.log("Kulas:", kulas);
  } catch (error) {
    console.error("Error executing query:", error);
  } finally {
    client.release();
    process.exit(0);
  }
});
