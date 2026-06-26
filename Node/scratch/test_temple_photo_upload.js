const fs = require('fs');
const path = require('path');

async function run() {
  try {
    // 1. Create a dummy image file content
    const blob = new Blob(['mock image data'], { type: 'image/jpeg' });

    // 2. Prepare FormData
    const formData = new FormData();
    formData.append('temple_basic_id', '1'); // use any valid basic id
    formData.append('active', 'true');
    formData.append('other_names', 'Sivan Kovil, Murugan Kovil');
    formData.append('special_features', 'Very ancient temple');
    formData.append('characteristics', 'Peaceful');
    formData.append('heritage', '1000 years');
    formData.append('miracles', 'None');
    formData.append('temple_structure', 'Gopuram style');
    formData.append('sanctum_structure', 'Stone');
    formData.append('history', 'Built by kings');
    formData.append('rajagopuram_direction', 'East');
    formData.append('status', 'ஒன்று');
    formData.append('worship_type', 'பொது மட்டும்');
    formData.append('song_place', 'false');
    formData.append('song_note', '');
    formData.append('padal_padiyavar', '');
    formData.append('entha_pathi', '');
    formData.append('mandapams', 'Vasantha Mandapam');
    
    // We send two deities: index 0 and index 1.
    // Index 0 has a new file upload.
    // Index 1 has an existing photo filename (or no photo).
    const deities = [
      { deivam: 'சிவன் (Shivan)', thesai: 'கிழக்கு (East)', photo: '' },
      { deivam: 'முருகன் (Murugan)', thesai: 'மேற்கு (West)', photo: 'existing_photo.jpg' },
      { deivam: 'விநாயகர் (Vinayagar)', thesai: 'தெற்கு (South)', photo: '' }
    ];
    formData.append('theivankal', JSON.stringify(deities));
    formData.append('theivankal_photo_0', blob, 'shivan.jpg');

    console.log("Sending POST /temple_detail/create with deity photos...");
    const createRes = await fetch('http://localhost:3002/temple_detail/create', {
      method: 'POST',
      body: formData
    });

    const createResult = await createRes.json();
    console.log("Create Response status:", createRes.status);
    console.log("Create Response data:", JSON.stringify(createResult, null, 2));

    if (createRes.status !== 200 || !createResult.data || !createResult.data.data || !createResult.data.data.id) {
      throw new Error("Create failed");
    }

    const createdId = createResult.data.data.id;
    console.log("Created Temple Detail ID:", createdId);

    // 3. Retrieve all temple details to see if our data is present
    console.log("\nFetching all temple details...");
    const getRes = await fetch('http://localhost:3002/temple_details');
    const getResult = await getRes.json();
    console.log("Retrieve Status:", getRes.status);
    
    const rows = Array.isArray(getResult.data) ? getResult.data : (getResult.data?.data || []);
    const createdItem = rows.find(item => item.id === createdId);
    console.log("Retrieved created item's deities (theivankal):", JSON.stringify(createdItem ? createdItem.theivankal : null, null, 2));

    // 4. Test Update Endpoint
    console.log("\nTesting PUT /temple_detail/update/:id...");
    const updateFormData = new FormData();
    updateFormData.append('temple_basic_id', '1');
    updateFormData.append('active', 'true');
    updateFormData.append('other_names', 'Sivan Kovil Updated');
    updateFormData.append('special_features', 'Updated features');
    updateFormData.append('characteristics', 'Peaceful');
    updateFormData.append('heritage', '1000 years');
    updateFormData.append('miracles', 'None');
    updateFormData.append('temple_structure', 'Gopuram style');
    updateFormData.append('sanctum_structure', 'Stone');
    updateFormData.append('history', 'Built by kings');
    updateFormData.append('rajagopuram_direction', 'East');
    updateFormData.append('status', 'ஒன்று');
    updateFormData.append('worship_type', 'பொது மட்டும்');
    updateFormData.append('song_place', 'false');
    updateFormData.append('song_note', '');
    updateFormData.append('padal_padiyavar', '');
    updateFormData.append('entha_pathi', '');
    updateFormData.append('mandapams', 'Vasantha Mandapam');

    // Update deities: keep the first (which now has a filename saved), and upload a new image for the second.
    const savedPhotoName = createdItem.theivankal[0].photo;
    const updatedDeities = [
      { deivam: 'சிவன் (Shivan)', thesai: 'கிழக்கு (East)', photo: savedPhotoName },
      { deivam: 'முருகன் (Murugan)', thesai: 'மேற்கு (West)', photo: '' },
      { deivam: 'விநாயகர் (Vinayagar)', thesai: 'தெற்கு (South)', photo: 'default_vinayagar.svg' }
    ];
    updateFormData.append('theivankal', JSON.stringify(updatedDeities));
    
    // Upload photo for the second deity (index 1)
    const newBlob = new Blob(['updated mock image data'], { type: 'image/jpeg' });
    updateFormData.append('theivankal_photo_1', newBlob, 'murugan_updated.jpg');

    const updateRes = await fetch(`http://localhost:3002/temple_detail/update/${createdId}`, {
      method: 'PUT',
      body: updateFormData
    });

    const updateResult = await updateRes.json();
    console.log("Update Response status:", updateRes.status);
    console.log("Update Response data:", JSON.stringify(updateResult, null, 2));

    // Retrieve again to verify update
    console.log("\nFetching temple details after update...");
    const getRes2 = await fetch('http://localhost:3002/temple_details');
    const getResult2 = await getRes2.json();
    const rows2 = Array.isArray(getResult2.data) ? getResult2.data : (getResult2.data?.data || []);
    const updatedItem = rows2.find(item => item.id === createdId);
    console.log("Updated item's deities (theivankal):", JSON.stringify(updatedItem ? updatedItem.theivankal : null, null, 2));

    process.exit(0);
  } catch (e) {
    console.error("Test Error:", e);
    process.exit(1);
  }
}

run();
