require("dotenv").config();
const TempleDetailsController = require("../model/temple_details");

TempleDetailsController.GetTempleDetails((err, result) => {
  if (err) {
    console.error("Error fetching temple details:", err);
    process.exit(1);
  }
  console.log("Fetch success! Temple details rows count:", result.data.length);
  const samples = result.data.filter(r => r.other_names);
  console.log(`Found ${samples.length} rows containing other_names.`);
  
  if (samples.length > 0) {
    console.log("Sample row with other_names:");
    console.log({
      id: samples[0].id,
      temple_basic_id: samples[0].temple_basic_id,
      mandapams: samples[0].mandapams,
      other_names: samples[0].other_names
    });
  } else {
    console.log("No rows with other_names found in the database. All rows:", result.data.map(r => ({ id: r.id, other_names: r.other_names })));
  }
  process.exit(0);
});
