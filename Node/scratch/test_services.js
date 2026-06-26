const https = require("https");
const axios = require("axios");

const fetchLiveApiKey = (serviceName) => {
  return new Promise((resResolve) => {
    https.get(`https://user.jobes24x7.com/api/api-key/public/api-key?service_name=${serviceName}&platform_type=WEB`, (res) => {
      let data = "";
      res.on("data", (chunk) => data += chunk);
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.success && parsed.api_key) {
            resResolve(parsed.api_key);
          } else {
            resResolve(null);
          }
        } catch (e) {
          resResolve(null);
        }
      });
    }).on("error", () => resResolve(null));
  });
};

async function checkServices() {
  const services = ["Product", "Service", "epay", "Epay", "E-pay", "EPAY", "product", "service"];
  for (const s of services) {
    const key = await fetchLiveApiKey(s);
    if (key) {
      console.log(`Service '${s}' has key: ${key}`);
      try {
        const res = await axios.get(`https://srivagroups.in/api/categories?t=${Date.now()}`, {
          headers: {
            "x-api-key": key,
            "x-service-name": s,
            "x-platform": "WEB"
          }
        });
        const categories = res.data.data || [];
        console.log(`  -> Returned ${categories.length} categories`);
        const searchKeyword = "asaivam";
        const matches = categories.filter(c => 
          (c.category_name && c.category_name.toLowerCase().includes(searchKeyword)) ||
          (c.sub_sector_name && c.sub_sector_name.toLowerCase().includes(searchKeyword)) ||
          (c.sector_name && c.sector_name.toLowerCase().includes(searchKeyword))
        );
        if (matches.length > 0) {
          console.log(`  -> FOUND matches for '${searchKeyword}'!`);
          console.log(matches);
        }
      } catch (err) {
        console.log(`  -> Error calling API for '${s}': ${err.message}`);
      }
    } else {
      console.log(`Service '${s}' has no active key`);
    }
  }
}

checkServices();
