require("dotenv").config();
const TempleDetailsController = require("../model/temple_details");

// First fetch details for id: 10
TempleDetailsController.GetTempleDetails((err, result) => {
  if (err) {
    console.error("Error fetching temple details:", err);
    process.exit(1);
  }
  
  const targetRow = result.data.find(r => r.id === 10);
  if (!targetRow) {
    console.error("Row with id 10 not found!");
    process.exit(1);
  }

  // Update request body with theivankal array
  const updatePayload = {
    id: targetRow.id,
    active: targetRow.active === 1 || targetRow.active === true || targetRow.active?.data?.[0] === 1 ? 1 : 0,
    characteristics: targetRow.characteristics,
    heritage: targetRow.heritage,
    history: targetRow.history,
    mandapams: targetRow.mandapams,
    miracles: targetRow.miracles,
    other_names: targetRow.other_names,
    rajagopuram_direction: targetRow.rajagopuram_direction,
    sanctum_structure: targetRow.sanctum_structure,
    song_note: targetRow.song_note,
    song_place: targetRow.song_place === 1 || targetRow.song_place === true || targetRow.song_place?.data?.[0] === 1 ? 1 : 0,
    special_features: targetRow.special_features,
    status: targetRow.status,
    temple_structure: targetRow.temple_structure,
    temple_basic_id: targetRow.temple_basic_id,
    padal_padiyavar: targetRow.padal_padiyavar,
    entha_pathi: targetRow.entha_pathi,
    worship_type: targetRow.worship_type,
    theivankal: [
      { deivam: 'விநாயகர் (Vinayagar)', thesai: 'கிழக்கு (East)' },
      { deivam: 'முருகன் (Murugan)', thesai: 'வடக்கு (North)' }
    ]
  };

  console.log("Updating row id 10 with payload:", JSON.stringify(updatePayload, null, 2));

  TempleDetailsController.UpdateTempleDetail(updatePayload, (updateErr, updateResult) => {
    if (updateErr) {
      console.error("Error updating temple details:", updateErr);
      process.exit(1);
    }
    console.log("Update Success result:", updateResult);

    // Fetch again to verify
    TempleDetailsController.GetTempleDetails((fetchErr, fetchResult) => {
      if (fetchErr) {
        console.error("Error re-fetching temple details:", fetchErr);
        process.exit(1);
      }
      const updatedRow = fetchResult.data.find(r => r.id === 10);
      console.log("Re-fetched row with id 10:");
      console.log(JSON.stringify({
        id: updatedRow.id,
        temple_basic_id: updatedRow.temple_basic_id,
        mandapams: updatedRow.mandapams,
        other_names: updatedRow.other_names,
        theivankal: updatedRow.theivankal
      }, null, 2));
      process.exit(0);
    });
  });
});
