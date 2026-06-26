require("dotenv").config();
const TempleDetailsController = require("../model/temple_details");

TempleDetailsController.GetTempleDetails((err, result) => {
  if (err) {
    console.error("Error fetching temple details:", err);
    process.exit(1);
  }
  console.log("Fetch success! Temple details rows count:", result.data.length);
  const samples = result.data;
  console.log("Details returned for rows:");
  console.log(JSON.stringify(samples.map(r => ({
    id: r.id,
    temple_basic_id: r.temple_basic_id,
    mandapams: r.mandapams,
    other_names: r.other_names,
    theivankal: r.theivankal
  })), null, 2));
  process.exit(0);
});
