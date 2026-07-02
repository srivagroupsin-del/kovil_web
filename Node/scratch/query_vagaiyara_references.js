require('dotenv').config();
const { getConnectionWsinventoryPool } = require("../lib/connection");

getConnectionWsinventoryPool(async (err, client) => {
  if (err) {
    console.error("DB connection error:", err);
    process.exit(1);
  }
  try {
    const idToDelete = 6;
    console.log(`Checking references for vagaiyara_id = ${idToDelete}...`);

    const [fks] = await client.query(`
      SELECT 
        TABLE_NAME, 
        COLUMN_NAME, 
        CONSTRAINT_NAME, 
        REFERENCED_TABLE_NAME, 
        REFERENCED_COLUMN_NAME 
      FROM 
        INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
      WHERE 
        REFERENCED_TABLE_NAME = 'vagaiyaras' 
        AND REFERENCED_TABLE_SCHEMA = 'temple_data'
    `);
    
    console.log("Foreign keys pointing to vagaiyaras:", fks);

    for (const fk of fks) {
      const tableName = fk.TABLE_NAME;
      const columnName = fk.COLUMN_NAME;
      const [rows] = await client.query(`SELECT COUNT(*) as count FROM \`${tableName}\` WHERE \`${columnName}\` = ?`, [idToDelete]);
      console.log(`Table ${tableName}: found ${rows[0].count} referencing rows for ID ${idToDelete}`);
    }

  } catch (error) {
    console.error("Error checking references:", error);
  } finally {
    client.release();
    process.exit(0);
  }
});
