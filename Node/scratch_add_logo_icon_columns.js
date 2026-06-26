require("dotenv").config();
const { getConnectionWsinventoryPool } = require("./lib/connection");

const queries = [
  "ALTER TABLE communities ADD COLUMN logo_path VARCHAR(255) DEFAULT NULL AFTER image_path, ADD COLUMN icon_path VARCHAR(255) DEFAULT NULL AFTER logo_path",
  "ALTER TABLE sub_communities ADD COLUMN logo_path VARCHAR(255) DEFAULT NULL AFTER image_path, ADD COLUMN icon_path VARCHAR(255) DEFAULT NULL AFTER logo_path",
  "ALTER TABLE kulas ADD COLUMN logo_path VARCHAR(255) DEFAULT NULL AFTER image_path, ADD COLUMN icon_path VARCHAR(255) DEFAULT NULL AFTER logo_path"
];

getConnectionWsinventoryPool(async (err, client) => {
  if (err) {
    console.error("Connection error:", err);
    process.exit(1);
  }
  try {
    for (const query of queries) {
      console.log(`Executing: ${query}`);
      try {
        await client.query(query);
        console.log("Executed successfully!");
      } catch (err) {
        if (err.message.includes("Duplicate column name")) {
          console.log("Column already exists, skipping...");
        } else {
          throw err;
        }
      }
    }
  } catch (error) {
    console.error("Error altering tables:", error);
  } finally {
    client.release();
    process.exit(0);
  }
});
