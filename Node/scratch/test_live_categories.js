require("dotenv").config();
const axios = require("axios");
const ApiKeyModel = require("../model/apiKey");

async function checkLive() {
  try {
    const activeKeyRecord = await ApiKeyModel.getActiveKey("login", "WEB");
    const externalHeaders = {
      "x-api-key": activeKeyRecord.access_token,
      "x-service-name": "login",
      "x-platform": "WEB"
    };

    console.log("Fetching live categories from: https://srivagroups.in/api/categories");
    const res = await axios.get(`https://srivagroups.in/api/categories?t=${Date.now()}`, {
      headers: externalHeaders
    });

    const categories = res.data.data || [];
    console.log("Total categories returned:", categories.length);

    // Search for any category name containing "asaivam" or similar keywords
    const searchKeyword = "asaivam";
    const matches = categories.filter(c => 
      (c.category_name && c.category_name.toLowerCase().includes(searchKeyword)) ||
      (c.sub_sector_name && c.sub_sector_name.toLowerCase().includes(searchKeyword)) ||
      (c.sector_name && c.sector_name.toLowerCase().includes(searchKeyword))
    );

    console.log(`Found ${matches.length} matching categories for '${searchKeyword}':`);
    console.log(JSON.stringify(matches, null, 2));

    // Print all distinct sub-sector names from the API to see what's available
    const subSectors = Array.from(new Set(categories.map(c => c.sub_sector_name).filter(Boolean))).sort();
    console.log("Available sub sectors from API:", subSectors);

  } catch (err) {
    console.error("Error fetching live categories:", err.message);
  }
}

checkLive();
