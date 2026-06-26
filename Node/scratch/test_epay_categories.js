require("dotenv").config();
const axios = require("axios");
const { getConnectionWsinventoryPool } = require("../lib/connection");
const ApiKeyModel = require("../model/apiKey");

async function checkEpay() {
  try {
    getConnectionWsinventoryPool(async (err, client) => {
      if (err) {
        console.error("DB connection error:", err.message);
        process.exit(1);
      }
      try {
        const [rows] = await client.query("SELECT * FROM api_keys WHERE service_name = 'epay'");
        console.log("Epay keys in DB:", rows);

        let serviceName = "login";
        if (rows.length > 0) {
          serviceName = "epay";
        } else {
          console.log("No epay key found. Checking all keys in DB...");
          const [allRows] = await client.query("SELECT * FROM api_keys");
          console.log(allRows);
        }

        const activeKeyRecord = await ApiKeyModel.getActiveKey(serviceName, "WEB");
        const externalHeaders = {
          "x-api-key": activeKeyRecord.access_token,
          "x-service-name": serviceName,
          "x-platform": "WEB"
        };

        console.log(`Fetching live categories from: https://srivagroups.in/api/categories using service: ${serviceName}`);
        const res = await axios.get(`https://srivagroups.in/api/categories?t=${Date.now()}`, {
          headers: externalHeaders
        });

        const categories = res.data.data || [];
        console.log("Total categories returned:", categories.length);

        const subSectors = Array.from(new Set(categories.map(c => c.sub_sector_name).filter(Boolean))).sort();
        console.log("Available sub sectors from API:", subSectors);

        const searchKeyword = "asaivam";
        const matches = categories.filter(c => 
          (c.category_name && c.category_name.toLowerCase().includes(searchKeyword)) ||
          (c.sub_sector_name && c.sub_sector_name.toLowerCase().includes(searchKeyword)) ||
          (c.sector_name && c.sector_name.toLowerCase().includes(searchKeyword))
        );
        console.log(`Found ${matches.length} matching categories for '${searchKeyword}':`, matches);

        process.exit(0);
      } catch (qErr) {
        console.error(qErr);
        process.exit(1);
      } finally {
        client.release();
      }
    });
  } catch (err) {
    console.error("Error:", err.message);
  }
}

checkEpay();
