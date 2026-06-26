require("dotenv").config();
const MoolavarController = require("./model/moolavar");

const testPayload = {
  status: "அருவம்",
  name: "சிவன்",
  deity_name: "சிவன், ஈசன், சிவபெருமான்",
  special_name: "அருள்மிகு, ஸ்ரீ, மகாதேவர்",
  divine_speciality: "முக்கண்ணன், நெற்றிக்கண்ணன்",
  deity_form: "லிங்கம்",
  form_speciality: "சுயம்பு",
  temple_id: 1,
};

console.log("Testing CreateMoolavar with validation...");
MoolavarController.CreateMoolavar(testPayload, (err, result) => {
  if (err) {
    console.error("Error creating moolavar:", err);
  } else {
    console.log("Successfully created moolavar:", result);
    
    // Now let's fetch it
    MoolavarController.GetMoolavarById(result.data.id, (err2, result2) => {
      if (err2) {
        console.error("Error fetching moolavar:", err2);
      } else {
        console.log("Successfully fetched moolavar:", result2);
      }
      process.exit(0);
    });
  }
});
