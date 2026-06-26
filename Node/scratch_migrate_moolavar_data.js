require("dotenv").config();
const { getConnectionWsinventoryPool } = require("./lib/connection");

getConnectionWsinventoryPool(async (err, client) => {
  if (err) {
    console.error("Connection error:", err);
    process.exit(1);
  }
  try {
    // 1. Fetch current child data to restore deity_form to main table
    // In previous migration, we stored row.deity_form in moolavar_deity_names (as deity_name).
    // Let's restore those values back to deity_form in moolavar table.
    const [rows] = await client.query("SELECT id, deity_name, special_name, divine_speciality FROM moolavar");
    console.log(`Restoring deity_form and migrating data for ${rows.length} records...`);

    for (const row of rows) {
      const moolavarId = row.id;

      // Fetch the deity forms we stored in moolavar_deity_names in the previous turn
      const [prevDeityNames] = await client.query("SELECT deity_name FROM moolavar_deity_names WHERE moolavar_id = ?", [moolavarId]);
      const restoredDeityForm = prevDeityNames.map(r => r.deity_name).join(', ') || null;

      // Update main table columns
      // - deity_form gets restored
      // - deity_name, special_name, divine_speciality will be set to NULL (since they are now fully in child tables)
      await client.query(
        "UPDATE moolavar SET deity_form = ?, deity_name = NULL, special_name = NULL, divine_speciality = NULL WHERE id = ?",
        [restoredDeityForm, moolavarId]
      );
      
      console.log(`- Restored deity_form: "${restoredDeityForm}" for Moolavar ID: ${moolavarId}`);

      // Clear all child tables first
      await client.query("DELETE FROM moolavar_special_names WHERE moolavar_id = ?", [moolavarId]);
      await client.query("DELETE FROM moolavar_deity_names WHERE moolavar_id = ?", [moolavarId]);
      await client.query("DELETE FROM moolavar_divine_specialities WHERE moolavar_id = ?", [moolavarId]);

      // Split and migrate deity_name (from the original row)
      if (row.deity_name) {
        const deityNames = row.deity_name.split(',').map(s => s.trim()).filter(Boolean);
        for (const name of deityNames) {
          await client.query("INSERT INTO moolavar_deity_names (moolavar_id, deity_name) VALUES (?, ?)", [moolavarId, name]);
        }
        console.log(`  - Migrated ${deityNames.length} deity names to moolavar_deity_names.`);
      }

      // Split and migrate special_name (from the original row)
      if (row.special_name) {
        const specialNames = row.special_name.split(',').map(s => s.trim()).filter(Boolean);
        for (const name of specialNames) {
          await client.query("INSERT INTO moolavar_special_names (moolavar_id, special_name) VALUES (?, ?)", [moolavarId, name]);
        }
        console.log(`  - Migrated ${specialNames.length} special names to moolavar_special_names.`);
      }

      // Split and migrate divine_speciality (from the original row)
      if (row.divine_speciality) {
        const divineSpecs = row.divine_speciality.split(',').map(s => s.trim()).filter(Boolean);
        for (const spec of divineSpecs) {
          await client.query("INSERT INTO moolavar_divine_specialities (moolavar_id, divine_speciality) VALUES (?, ?)", [moolavarId, spec]);
        }
        console.log(`  - Migrated ${divineSpecs.length} divine specialities to moolavar_divine_specialities.`);
      }
    }

    console.log("Migration completed successfully!");

  } catch (error) {
    console.error("Migration error:", error);
  } finally {
    client.release();
    process.exit(0);
  }
});
