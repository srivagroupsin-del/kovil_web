require("dotenv").config();
const MoolavarController = require("./model/moolavar");

MoolavarController.DeleteMoolavar({ id: 14 }, (err, result) => {
  if (err) {
    console.error("Error cleaning up:", err);
  } else {
    console.log("Successfully cleaned up test record.");
  }
  process.exit(0);
});
