const axios = require("axios");

async function checkNoHeaders() {
  try {
    console.log("Fetching live categories from: https://srivagroups.in/api/categories WITHOUT headers...");
    const res = await axios.get(`https://srivagroups.in/api/categories?t=${Date.now()}`);

    const categories = res.data.data || [];
    console.log("Total categories returned without headers:", categories.length);

    const searchKeyword = "asaivam";
    const matches = categories.filter(c => 
      (c.category_name && c.category_name.toLowerCase().includes(searchKeyword)) ||
      (c.sub_sector_name && c.sub_sector_name.toLowerCase().includes(searchKeyword)) ||
      (c.sector_name && c.sector_name.toLowerCase().includes(searchKeyword))
    );
    console.log(`Found ${matches.length} matching categories for '${searchKeyword}':`, matches);

  } catch (err) {
    console.error("Error fetching without headers:", err.message);
  }
}

checkNoHeaders();
