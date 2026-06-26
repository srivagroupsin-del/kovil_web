const { getConnectionWsinventoryPool } = require("../lib/connection");
const https = require("https");

const ApiKeyModel = {
  getActiveKey: async (serviceName, platformType) => {
    return new Promise((resolve, reject) => {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) {
          return reject(new Error("Database connection error: " + err.message));
        }
        try {
          // Ensure database table exists
          const createTableQuery = `
            CREATE TABLE IF NOT EXISTS api_keys (
              id INT AUTO_INCREMENT PRIMARY KEY,
              service_name VARCHAR(100) NOT NULL,
              platform_type VARCHAR(100) NOT NULL,
              access_token VARCHAR(500) NOT NULL,
              status VARCHAR(50) DEFAULT 'Active',
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              UNIQUE KEY unique_service_platform (service_name, platform_type)
            )
          `;
          await client.query(createTableQuery);

          // Query the active API key
          const [rows] = await client.query(
            "SELECT access_token FROM api_keys WHERE service_name = ? AND platform_type = ? AND status = 'Active' LIMIT 1",
            [serviceName, platformType]
          );

          if (rows.length > 0) {
            resolve({ access_token: rows[0].access_token });
          } else {
            // Auto-fallback / seeding from external server for standard keys
            const serviceKey = serviceName.toLowerCase() === 'login' ? 'Login' : serviceName;
            const platformKey = platformType.toUpperCase() === 'WEB' ? 'WEB' : platformType;

            console.log(`No active API key in DB for ${serviceName}/${platformType}. Attempting to fetch from external server...`);
            
            const fetchLiveApiKey = () => {
              return new Promise((resResolve, resReject) => {
                https.get(`https://user.jobes24x7.com/api/api-key/public/api-key?service_name=${encodeURIComponent(serviceKey)}&platform_type=${encodeURIComponent(platformKey)}`, (res) => {
                  let data = "";
                  res.on("data", (chunk) => data += chunk);
                  res.on("end", () => {
                    try {
                      const parsed = JSON.parse(data);
                      if (parsed.success && parsed.api_key) {
                        resResolve(parsed.api_key);
                      } else {
                        resReject(new Error("Failed to get API key from response: " + data));
                      }
                    } catch (e) {
                      resReject(e);
                    }
                  });
                }).on("error", (err) => resReject(err));
              });
            };

            try {
              const fetchedKey = await fetchLiveApiKey();
              // Save it to the database so next queries won't need an external call
              await client.query(
                "INSERT INTO api_keys (service_name, platform_type, access_token, status) VALUES (?, ?, ?, 'Active') ON DUPLICATE KEY UPDATE access_token = ?, status = 'Active'",
                [serviceName, platformType, fetchedKey, fetchedKey]
              );
              resolve({ access_token: fetchedKey });
            } catch (fetchErr) {
              console.error(`Failed to fetch live API key for ${serviceName}/${platformType}:`, fetchErr.message);
              resolve(null);
            }
          }
        } catch (dbErr) {
          reject(dbErr);
        } finally {
          client.release();
        }
      });
    });
  }
};

module.exports = ApiKeyModel;
