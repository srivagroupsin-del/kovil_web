const https = require("https");
const axios = require("axios");

const fetchLiveApiKey = (serviceName) => {
  return new Promise((resResolve, resReject) => {
    https.get(`https://user.jobes24x7.com/api/api-key/public/api-key?service_name=${serviceName}&platform_type=WEB`, (res) => {
      let data = "";
      res.on("data", (chunk) => data += chunk);
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.success && parsed.api_key) {
            resResolve(parsed.api_key);
          } else {
            resReject(new Error("Failed to get API key: " + data));
          }
        } catch (e) {
          resReject(e);
        }
      });
    }).on("error", (err) => resReject(err));
  });
};

async function checkEpayLive() {
  try {
    const liveKey = await fetchLiveApiKey("epay");
    console.log("Found live epay API key:", liveKey);

    const externalHeaders = {
      "x-api-key": liveKey,
      "x-service-name": "epay",
      "x-platform": "WEB"
    };

    console.log("Fetching live categories using epay...");
    const res = await axios.get(`https://srivagroups.in/api/categories?t=${Date.now()}`, {
      headers: externalHeaders
    });

    const categories = res.data.data || [];
    console.log("Total categories returned for epay:", categories.length);

    const subSectors = Array.from(new Set(categories.map(c => c.sub_sector_name).filter(Boolean))).sort();
    console.log("Available sub sectors under epay:", subSectors);

    const searchKeyword = "asaivam";
    const matches = categories.filter(c => 
      (c.category_name && c.category_name.toLowerCase().includes(searchKeyword)) ||
      (c.sub_sector_name && c.sub_sector_name.toLowerCase().includes(searchKeyword)) ||
      (c.sector_name && c.sector_name.toLowerCase().includes(searchKeyword))
    );
    console.log(`Found ${matches.length} matches for 'asaivam':`, matches);

  } catch (err) {
    console.error("Error with epay:", err.message);
  }
}

checkEpayLive();
