const Joi = require("joi");
const fs = require("fs");
const path = require("path");
const { getConnectionWsinventoryPool } = require("../lib/connection");

const result_success = "Success";
const result_failure = "Failure";

const kulaDeivamSchema = Joi.object({
  id: Joi.number().integer().optional(),
  community_id: Joi.number().integer().required(),
  sub_community_id: Joi.number().integer().required(),
  kula_id: Joi.number().integer().required(),
  deity_name_tamil: Joi.string().required(),
  deity_name_english: Joi.string().allow('', null).optional(),
  title: Joi.string().allow('', null).optional(),
  info: Joi.string().allow('', null).optional(),
  image_path: Joi.string().allow('', null).optional(),
  logo_path: Joi.string().allow('', null).optional(),
  icon_path: Joi.string().allow('', null).optional(),
  description: Joi.string().allow('', null).optional(),
  history: Joi.string().allow('', null).optional(),
  status: Joi.string().valid('active', 'inactive').default('active')
});

function saveBase64Image(base64Str, prefix = 'kuladeivam') {
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

const KulaDeivamsController = {
  CreateKulaDeivam: (params, callback) => {
    const { error, value } = kulaDeivamSchema.validate(params);
    if (error) {
      return callback({ result: result_failure, code: 400, message: error.message }, null);
    }

    const savedImage = saveBase64Image(value.image_path, 'kuladeivam');
    const savedLogo = saveBase64Image(value.logo_path, 'kuladeivam_logo');
    const savedIcon = saveBase64Image(value.icon_path, 'kuladeivam_icon');

    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const insertQuery = `
            INSERT INTO kula_deivams
            (community_id, sub_community_id, kula_id, deity_name_tamil, deity_name_english, title, info, image_path, logo_path, icon_path, description, history, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;
          const [result] = await client.query(insertQuery, [
            value.community_id,
            value.sub_community_id,
            value.kula_id,
            value.deity_name_tamil,
            value.deity_name_english || null,
            value.title || null,
            value.info || null,
            savedImage || null,
            savedLogo || null,
            savedIcon || null,
            value.description || null,
            value.history || null,
            value.status || 'active'
          ]);

          callback(null, { result: result_success, code: 200, message: "Kula Deivam created successfully", id: result.insertId });
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

  UpdateKulaDeivam: (params, callback) => {
    const { error, value } = kulaDeivamSchema.validate(params);
    if (error) {
      return callback({ result: result_failure, code: 400, message: error.message }, null);
    }
    if (!value.id) {
      return callback({ result: result_failure, code: 400, message: "ID is required for update" }, null);
    }

    const savedImage = saveBase64Image(value.image_path, 'kuladeivam');
    const savedLogo = saveBase64Image(value.logo_path, 'kuladeivam_logo');
    const savedIcon = saveBase64Image(value.icon_path, 'kuladeivam_icon');

    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const updateQuery = `
            UPDATE kula_deivams
            SET community_id = ?, sub_community_id = ?, kula_id = ?, deity_name_tamil = ?, deity_name_english = ?, title = ?, info = ?, image_path = ?, logo_path = ?, icon_path = ?, description = ?, history = ?, status = ?
            WHERE id = ?
          `;
          await client.query(updateQuery, [
            value.community_id,
            value.sub_community_id,
            value.kula_id,
            value.deity_name_tamil,
            value.deity_name_english || null,
            value.title || null,
            value.info || null,
            savedImage || null,
            savedLogo || null,
            savedIcon || null,
            value.description || null,
            value.history || null,
            value.status || 'active',
            value.id
          ]);

          callback(null, { result: result_success, code: 200, message: "Kula Deivam updated successfully" });
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

  GetKulaDeivams: (callback) => {
    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);
        try {
          const [rows] = await client.query("SELECT * FROM kula_deivams ORDER BY id DESC");
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

  GetKulaDeivamById: (id, callback) => {
    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);
        try {
          const [rows] = await client.query("SELECT * FROM kula_deivams WHERE id = ?", [id]);
          if (rows.length === 0) {
            return callback({ result: result_failure, code: 404, message: "Kula Deivam not found" }, null);
          }
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

  DeleteKulaDeivam: (params, callback) => {
    const id = params.id;
    if (!id) {
      return callback({ result: result_failure, code: 400, message: "ID is required for delete" }, null);
    }
    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);
        try {
          await client.query("DELETE FROM kula_deivams WHERE id = ?", [id]);
          callback(null, { result: result_success, code: 200, message: "Kula Deivam deleted successfully" });
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

module.exports = KulaDeivamsController;
