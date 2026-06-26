require("dotenv").config();
const { getConnectionWsinventoryPool } = require("./lib/connection");

getConnectionWsinventoryPool(async (err, client) => {
  if (err) {
    console.error("Connection error:", err);
    process.exit(1);
  }
  try {
    const [comms] = await client.query("SELECT id, community_name_tamil FROM communities WHERE community_name_tamil LIKE '%நாடார்%'");
    const [subs] = await client.query("SELECT id, sub_community_name_tamil FROM sub_communities WHERE sub_community_name_tamil LIKE '%கருப்பாம்பாடி%'");
    const [kulas] = await client.query("SELECT id, kula_name_tamil FROM kulas WHERE kula_name_tamil LIKE '%பொன்னர்%'");
    
    console.log("MATCHING COMMUNITIES:", comms);
    console.log("MATCHING SUB-COMMUNITIES:", subs);
    console.log("MATCHING KULAS:", kulas);
  } catch (error) {
    console.error("Error querying database:", error);
  } finally {
    client.release();
    process.exit(0);
  }
});
