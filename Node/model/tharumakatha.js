const Joi = require("joi");
const winston = require("winston");
const bcrypt = require("bcryptjs");
const https = require("https");
const { getConnectionWsinventoryPool } = require("../lib/connection");

const result_success = "Success";
const result_failure = "Failure";

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

const tharumakathaSchema = Joi.object({
  id: Joi.number().integer().optional(),
  name: Joi.string().required(),
  phone: Joi.string().allow('', null).optional(),
  email: Joi.string().allow('', null).optional(),
  photo_path: Joi.string().allow('', null).optional(),
  can_create_temple: Joi.number().integer().min(0).max(1).optional().default(0),
  status: Joi.string().allow('', null).optional().default('active'),
  temple_id: Joi.number().integer().optional(),
  templeId: Joi.number().integer().optional(),
  role: Joi.string().allow('', null).optional(),
  assigned_work: Joi.string().allow('', null).optional(),
  password: Joi.string().allow('', null).optional()
});

const deleteSchema = Joi.object({
  id: Joi.number().integer().required(),
});

const TharumakathaController = (function () {
  
  const _createTharumakatha = async (jsonValue, callback) => {
    const { error, value } = tharumakathaSchema.validate(jsonValue);

    if (error || !value) {
      return callback({ result: result_failure, code: 400, message: error ? error.message : "Invalid request body" }, null);
    }

    const finalTempleId = value.temple_id || value.templeId;

    if (!finalTempleId) {
       return callback({ result: result_failure, code: 400, message: "\"temple_id\" is required" }, null);
    }

    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const insertQuery = `
            INSERT INTO tharumakatha
            (name, phone, email, photo_path, can_create_temple, status, temple_id, role, assigned_work, password)
            VALUES
            (?,?,?,?,?,?,?,?,?,?)
          `;

          const hashedPassword = value.password ? bcrypt.hashSync(value.password, 10) : null;

          const [result] = await client.query(insertQuery, [
            value.name,
            value.phone || null,
            value.email || null,
            value.photo_path || null,
            value.can_create_temple !== undefined ? value.can_create_temple : 0,
            value.status || 'active',
            finalTempleId,
            value.role || null,
            value.assigned_work || null,
            hashedPassword
          ]);

          callback(null, {
            result: result_success,
            code: 200,
            message: "Tharumakatha created successfully",
            data: { id: result.insertId },
          });
        } catch (queryError) {
          callback({ result: result_failure, code: 400, message: queryError.message }, null);
        } finally {
          client.release();
        }
      });
    } catch (err) {
      callback({ result: result_failure, code: 500, message: "Internal server error" }, null);
    }
  };

  const _getTharumakatha = async (callback) => {
    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const query = `
            SELECT id, name, phone, email, photo_path, can_create_temple, status, temple_id, role, assigned_work, created_date, updated_date
            FROM tharumakatha
            ORDER BY id DESC;
          `;
          const [rows] = await client.query(query);
          callback(null, { result: result_success, code: 200, data: rows });
        } catch (queryError) {
          callback({ result: result_failure, code: 400, message: queryError.message }, null);
        } finally {
          client.release();
        }
      });
    } catch (err) {
      callback({ result: result_failure, code: 500, message: "Internal server error" }, null);
    }
  };

  const _getTharumakathaById = async (id, callback) => {
    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const query = `
            SELECT id, name, phone, email, photo_path, can_create_temple, status, temple_id, role, assigned_work, created_date, updated_date
            FROM tharumakatha
            WHERE id = ?
          `;
          const [rows] = await client.query(query, [id]);
          if (rows.length === 0) return callback({ result: result_failure, code: 404, message: "Tharumakatha not found" }, null);
          
          callback(null, { result: result_success, code: 200, data: rows[0] });
        } catch (queryError) {
          callback({ result: result_failure, code: 400, message: queryError.message }, null);
        } finally {
          client.release();
        }
      });
    } catch (err) {
      callback({ result: result_failure, code: 500, message: "Internal server error" }, null);
    }
  };

  const _getTharumakathaByTempleId = async (temple_id, callback) => {
    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const query = `
            SELECT id, name, phone, email, photo_path, can_create_temple, status, temple_id, role, assigned_work, created_date, updated_date
            FROM tharumakatha
            WHERE temple_id = ?
            ORDER BY id DESC;
          `;
          const [rows] = await client.query(query, [temple_id]);
          callback(null, { result: result_success, code: 200, data: rows });
        } catch (queryError) {
          callback({ result: result_failure, code: 400, message: queryError.message }, null);
        } finally {
          client.release();
        }
      });
    } catch (err) {
      callback({ result: result_failure, code: 500, message: "Internal server error" }, null);
    }
  };

  const _updateTharumakatha = async (jsonValue, callback) => {
    const { error, value } = tharumakathaSchema.validate(jsonValue);
    if (error || !value) return callback({ result: result_failure, code: 400, message: error ? error.message : "Invalid request body" }, null);

    const finalTempleId = value.temple_id || value.templeId;

    if (!finalTempleId) {
       return callback({ result: result_failure, code: 400, message: "\"temple_id\" is required" }, null);
    }

    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const checkQuery = `SELECT id FROM tharumakatha WHERE id = ?`;
          const [checkResult] = await client.query(checkQuery, [value.id]);
          if (checkResult.length === 0) return callback({ result: result_failure, code: 404, message: "Tharumakatha not found" }, null);

          let updateQuery = `
            UPDATE tharumakatha
            SET name = ?, phone = ?, email = ?, photo_path = COALESCE(?, photo_path), can_create_temple = ?, status = ?, temple_id = ?, role = ?, assigned_work = ?
          `;
          const queryParams = [
            value.name,
            value.phone || null,
            value.email || null,
            value.photo_path || null,
            value.can_create_temple !== undefined ? value.can_create_temple : 0,
            value.status || null,
            finalTempleId,
            value.role || null,
            value.assigned_work || null,
          ];

          if (value.password) {
            updateQuery += `, password = ? `;
            queryParams.push(bcrypt.hashSync(value.password, 10));
          }

          updateQuery += ` WHERE id = ?`;
          queryParams.push(value.id);

          await client.query(updateQuery, queryParams);

          callback(null, { result: result_success, code: 200, message: "Tharumakatha updated successfully" });
        } catch (queryError) {
          callback({ result: result_failure, code: 400, message: queryError.message }, null);
        } finally {
          client.release();
        }
      });
    } catch (err) {
      callback({ result: result_failure, code: 500, message: "Internal server error" }, null);
    }
  };

  const _deleteTharumakatha = async (jsonValue, callback) => {
    const { error, value } = deleteSchema.validate(jsonValue);
    if (error) return callback({ result: result_failure, code: 400, message: error.message }, null);

    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const checkQuery = `SELECT id FROM tharumakatha WHERE id = ?`;
          const [checkResult] = await client.query(checkQuery, [value.id]);
          if (checkResult.length === 0) return callback({ result: result_failure, code: 404, message: "Tharumakatha not found" }, null);

          const deleteQuery = `DELETE FROM tharumakatha WHERE id = ?`;
          await client.query(deleteQuery, [value.id]);

          callback(null, { result: result_success, code: 200, message: "Tharumakatha deleted successfully" });
        } catch (queryError) {
          callback({ result: result_failure, code: 400, message: queryError.message }, null);
        } finally {
          client.release();
        }
      });
    } catch (err) {
      callback({ result: result_failure, code: 500, message: "Internal server error" }, null);
    }
  };

  const _loginTharumakatha = async (jsonValue, callback) => {
    const { phone, password } = jsonValue;
    if (!phone || !password) return callback({ result: result_failure, code: 400, message: "Phone and password are required" }, null);

    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const query = `SELECT * FROM tharumakatha WHERE phone = ? OR email = ?`;
          const [rows] = await client.query(query, [phone, phone]);

          if (rows.length === 0) return callback({ result: result_failure, code: 401, message: "Invalid phone or password" }, null);

          const user = rows[0];
          
          if (user.status !== 'active') return callback({ result: result_failure, code: 403, message: "Account is inactive" }, null);

          // Try local authentication first if password exists in database
          let isMatch = false;
          if (user.password) {
            isMatch = bcrypt.compareSync(password, user.password);
          }

          // If local auth fails or no local password exists, try external user.jobes24x7.com authentication
          if (!isMatch) {
            const authEmail = user.email || phone; // fallback to input phone if email is missing
            try {
              console.log(`Attempting live authentication for trustee: ${authEmail} against user.jobes24x7.com...`);
              const apiKey = await fetchLiveApiKey();
              const authResult = await authenticateLiveUser(apiKey, authEmail, password);
              
              if (authResult.statusCode === 200 && authResult.data?.data?.result === "Success") {
                console.log("Live trustee authentication successful!");
                isMatch = true;
              } else {
                console.log("Live trustee authentication failed:", authResult.data?.message || "Non-200 response");
              }
            } catch (liveErr) {
              console.error("Error during live trustee authentication:", liveErr.message);
            }
          }

          if (!isMatch) {
            return callback({ result: result_failure, code: 401, message: "Invalid phone or password" }, null);
          }

          delete user.password;
          callback(null, { result: result_success, code: 200, message: "Login successful", data: user });
        } catch (queryError) {
          callback({ result: result_failure, code: 400, message: queryError.message }, null);
        } finally {
          client.release();
        }
      });
    } catch (err) {
      callback({ result: result_failure, code: 500, message: "Internal server error" }, null);
    }
  };

  return {
    CreateTharumakatha: _createTharumakatha,
    GetTharumakatha: _getTharumakatha,
    GetTharumakathaById: _getTharumakathaById,
    GetTharumakathaByTempleId: _getTharumakathaByTempleId,
    UpdateTharumakatha: _updateTharumakatha,
    DeleteTharumakatha: _deleteTharumakatha,
    LoginTharumakatha: _loginTharumakatha,
  };
})();

module.exports = TharumakathaController;
