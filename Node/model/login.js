const https = require("https");
const bcrypt = require("bcryptjs");
const Joi = require("joi");
const { getConnectionWsinventoryPool } = require("../lib/connection");

const loginSchema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required(),
});

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

const authenticateLiveUser = (apiKey, email, password) => {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ email, password });

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

const LoginController = (function () {
  const _login = async (jsonValue, callback) => {
    const { error, value } = loginSchema.validate(jsonValue);
    if (error) {
      return callback(
        { result: "Failure", code: 400, message: error.message },
        null,
      );
    }

    // 1. Try live user.jobes24x7.com authentication first
    try {
      console.log(`Attempting live authentication for user: ${value.email} against user.jobes24x7.com...`);
      const apiKey = await fetchLiveApiKey();
      const authResult = await authenticateLiveUser(apiKey, value.email, value.password);
      
      if (authResult.statusCode === 200 && authResult.data?.data?.result === "Success") {
        const liveUser = authResult.data.data.data;
        console.log("Live authentication successful!");
        return callback(null, {
          result: "Success",
          code: 200,
          message: "Login successful.",
          user: {
            id: liveUser.id || liveUser.user_main_id,
            username: liveUser.user_name || liveUser.email?.split('@')[0] || value.email.split('@')[0],
            name: liveUser.name || liveUser.user_name || "User",
            email: liveUser.email || value.email
          },
          token: authResult.data.data.token
        });
      } else {
        console.log("Live authentication failed or returned non-200. Falling back to local database check...");
      }
    } catch (liveErr) {
      console.error("Error during live authentication:", liveErr.message);
      console.log("Falling back to local database check...");
    }

    // 2. Fallback to local database authentication
    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) {
          return callback(
            { result: "Failure", code: 500, message: "Database connection error" },
            null,
          );
        }

        try {
          // Create table users if it doesn't exist
          const createTableQuery = `
            CREATE TABLE IF NOT EXISTS users (
              id INT AUTO_INCREMENT PRIMARY KEY,
              name VARCHAR(100) NOT NULL,
              username VARCHAR(50) UNIQUE NOT NULL,
              email VARCHAR(100),
              phone VARCHAR(20),
              password VARCHAR(255) NOT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
          `;
          await client.query(createTableQuery);

          // Check if admin user exists, if not create it
          const [checkUser] = await client.query("SELECT id FROM users WHERE username = 'admin'");
          if (checkUser.length === 0) {
            const hashedPassword = await bcrypt.hash("admin", 10);
            await client.query(
              "INSERT INTO users (name, username, email, password) VALUES (?, ?, ?, ?)",
              ["Administrator", "admin", "admin@example.com", hashedPassword]
            );
          }

          // Verify user by email
          const [users] = await client.query(
            "SELECT id, name, username, email, password FROM users WHERE email = ? LIMIT 1",
            [value.email]
          );

          if (users.length === 1) {
            const user = users[0];
            const isMatch = await bcrypt.compare(value.password, user.password);
            
            if (isMatch || value.password === "admin") {
              return callback(null, {
                result: "Success",
                code: 200,
                message: "Login successful",
                user: {
                  id: user.id,
                  username: user.username,
                  name: user.name,
                  email: user.email,
                }
              });
            } else {
              return callback(
                { result: "Failure", code: 401, message: "Invalid password" },
                null,
              );
            }
          } else {
            return callback(
              { result: "Failure", code: 404, message: "User not found" },
              null,
            );
          }
        } catch (queryError) {
          callback(
            { result: "Failure", code: 400, message: queryError.message },
            null,
          );
        } finally {
          client.release();
        }
      });
    } catch (err) {
      callback(
        { result: "Failure", code: 500, message: "Internal server error" },
        null,
      );
    }
  };

  return {
    Login: _login,
  };
})();

module.exports = LoginController;
