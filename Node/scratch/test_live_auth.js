const https = require("https");

const fetchLiveApiKey = () => {
  return new Promise((resolve, reject) => {
    https.get("https://user.jobes24x7.com/api/api-key/public/api-key?service_name=Login&platform_type=WEB", (res) => {
      let data = "";
      res.on("data", (chunk) => data += chunk);
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.success && parsed.api_key) {
            resolve(parsed.api_key);
          } else {
            reject(new Error("Failed to get API key from response: " + data));
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on("error", (err) => reject(err));
  });
};

const authenticateLiveUser = (apiKey, emailOrPhone, password) => {
  return new Promise((resolve, reject) => {
    const isEmail = emailOrPhone.includes("@");
    const payload = JSON.stringify(
      isEmail ? { email: emailOrPhone, password } : { phone_number: emailOrPhone, password }
    );

    const options = {
      hostname: "user.jobes24x7.com",
      path: "/api/login/authenticate",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "x-api-key": apiKey,
        "x-service-name": "Login",
        "x-platform": "WEB",
        "Content-Length": Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => data += chunk);
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ statusCode: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ statusCode: res.statusCode, raw: data });
        }
      });
    });

    req.on("error", (err) => reject(err));
    req.write(payload);
    req.end();
  });
};

async function run() {
  try {
    console.log("Fetching API key from live server...");
    const apiKey = await fetchLiveApiKey();
    console.log("Success! API key obtained:", apiKey);

    console.log("\nAttempting login for a dummy account...");
    const result = await authenticateLiveUser(apiKey, "dummy@example.com", "password");
    console.log("Result:", result);
  } catch (err) {
    console.error("Error occurred:", err);
  }
}

run();
