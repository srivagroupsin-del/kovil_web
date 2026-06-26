const Joi = require("joi");
const fs = require("fs");
const path = require("path");
const { getConnectionWsinventoryPool } = require("../lib/connection");

const result_success = "Success";
const result_failure = "Failure";

const communitySchema = Joi.object({
  id: Joi.number().integer().optional(),
  community_name_tamil: Joi.string().required(),
  community_name_english: Joi.string().required(),
  title: Joi.string().allow('', null).optional(),
  info: Joi.string().allow('', null).optional(),
  description: Joi.string().allow('', null).optional(),
  history: Joi.string().allow('', null).optional(),
  image_path: Joi.string().allow('', null).optional(),
  logo_path: Joi.string().allow('', null).optional(),
  icon_path: Joi.string().allow('', null).optional(),
  status: Joi.string().valid('active', 'inactive').default('active')
});

function saveBase64Image(base64Str, prefix = 'community') {
  if (!base64Str || !base64Str.startsWith('data:image/')) {
    return base64Str;
  }
  try {
    const matches = base64Str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return base64Str;
    }
    const mime = matches[1];
    let ext = mime.split('/')[1] || 'png';
    if (ext === 'jpeg') ext = 'jpg';
    if (ext === 'svg+xml') ext = 'svg';
    
    const dataBuffer = Buffer.from(matches[2], 'base64');
    const filename = `${prefix}_${Date.now()}_${Math.round(Math.random() * 1e9)}.${ext}`;
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    fs.writeFileSync(path.join(uploadDir, filename), dataBuffer);
    return filename;
  } catch (err) {
    console.error(`Failed to save ${prefix} base64 image:`, err);
    return base64Str;
  }
}

const CommunitiesController = {
  CreateCommunity: (params, callback) => {
    const { error, value } = communitySchema.validate(params);
    if (error) {
      return callback({ result: result_failure, code: 400, message: error.message }, null);
    }

    const savedImage = saveBase64Image(value.image_path, 'community');
    const savedLogo = saveBase64Image(value.logo_path, 'community_logo');
    const savedIcon = saveBase64Image(value.icon_path, 'community_icon');

    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const insertQuery = `
            INSERT INTO communities
            (community_name_tamil, community_name_english, title, info, description, history, image_path, logo_path, icon_path, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;
          const [result] = await client.query(insertQuery, [
            value.community_name_tamil,
            value.community_name_english,
            value.title || null,
            value.info || null,
            value.description || null,
            value.history || null,
            savedImage || null,
            savedLogo || null,
            savedIcon || null,
            value.status || 'active'
          ]);

          callback(null, { result: result_success, code: 200, message: "Community created successfully", id: result.insertId });
        } catch (dbErr) {
          callback({ result: result_failure, code: 400, message: dbErr.message }, null);
        } finally {
          client.release();
        }
      });
    } catch (e) {
      callback({ result: result_failure, code: 500, message: e.message }, null);
    }
  },

  GetCommunities: (callback) => {
    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const query = "SELECT * FROM communities ORDER BY id DESC";
          const [rows] = await client.query(query);
          callback(null, { result: result_success, code: 200, data: rows });
        } catch (dbErr) {
          callback({ result: result_failure, code: 400, message: dbErr.message }, null);
        } finally {
          client.release();
        }
      });
    } catch (e) {
      callback({ result: result_failure, code: 500, message: e.message }, null);
    }
  },

  GetCommunityById: (id, callback) => {
    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const query = "SELECT * FROM communities WHERE id = ?";
          const [rows] = await client.query(query, [id]);
          if (rows.length === 0) return callback({ result: result_failure, code: 404, message: "Community not found" }, null);
          callback(null, { result: result_success, code: 200, data: rows[0] });
        } catch (dbErr) {
          callback({ result: result_failure, code: 400, message: dbErr.message }, null);
        } finally {
          client.release();
        }
      });
    } catch (e) {
      callback({ result: result_failure, code: 500, message: e.message }, null);
    }
  },

  UpdateCommunity: (params, callback) => {
    const { error, value } = communitySchema.validate(params);
    if (error) return callback({ result: result_failure, code: 400, message: error.message }, null);
    if (!value.id) return callback({ result: result_failure, code: 400, message: "Community ID is required for update" }, null);

    const savedImage = saveBase64Image(value.image_path, 'community');
    const savedLogo = saveBase64Image(value.logo_path, 'community_logo');
    const savedIcon = saveBase64Image(value.icon_path, 'community_icon');

    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const checkQuery = "SELECT id FROM communities WHERE id = ?";
          const [check] = await client.query(checkQuery, [value.id]);
          if (check.length === 0) return callback({ result: result_failure, code: 404, message: "Community not found" }, null);

          const updateQuery = `
            UPDATE communities
            SET community_name_tamil = ?, community_name_english = ?, title = ?, info = ?, description = ?, history = ?, image_path = ?, logo_path = ?, icon_path = ?, status = ?
            WHERE id = ?
          `;
          await client.query(updateQuery, [
            value.community_name_tamil,
            value.community_name_english,
            value.title || null,
            value.info || null,
            value.description || null,
            value.history || null,
            savedImage || null,
            savedLogo || null,
            savedIcon || null,
            value.status || 'active',
            value.id
          ]);

          callback(null, { result: result_success, code: 200, message: "Community updated successfully" });
        } catch (dbErr) {
          callback({ result: result_failure, code: 400, message: dbErr.message }, null);
        } finally {
          client.release();
        }
      });
    } catch (e) {
      callback({ result: result_failure, code: 500, message: e.message }, null);
    }
  },

  DeleteCommunity: (params, callback) => {
    if (!params.id) return callback({ result: result_failure, code: 400, message: "Community ID is required" }, null);

    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const checkQuery = "SELECT id FROM communities WHERE id = ?";
          const [check] = await client.query(checkQuery, [params.id]);
          if (check.length === 0) return callback({ result: result_failure, code: 404, message: "Community not found" }, null);

          await client.query("DELETE FROM communities WHERE id = ?", [params.id]);
          callback(null, { result: result_success, code: 200, message: "Community deleted successfully" });
        } catch (dbErr) {
          callback({ result: result_failure, code: 400, message: dbErr.message }, null);
        } finally {
          client.release();
        }
      });
    } catch (e) {
      callback({ result: result_failure, code: 500, message: e.message }, null);
    }
  }
};

module.exports = CommunitiesController;
