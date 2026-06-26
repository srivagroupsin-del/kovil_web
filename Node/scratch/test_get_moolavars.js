require("dotenv").config();
const MoolavarController = require("../model/moolavar");

MoolavarController.GetMoolavars((err, result) => {
  if (err) {
    console.error("Error fetching moolavars:", err);
    process.exit(1);
  }
  console.log("Fetch success! Moolavars rows count:", result.data.length);
  const sample = result.data.find(r => r.photo);
  if (sample) {
    console.log("Sample row with photo:");
    console.log({
      id: sample.id,
      name: sample.name,
      photo: sample.photo
    });
  } else {
    console.log("No sample rows with photo found. All rows:", result.data.map(r => ({ id: r.id, name: r.name, photo: r.photo })));
  }
  process.exit(0);
});
