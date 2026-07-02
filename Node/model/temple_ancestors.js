const Joi = require("joi");
const fs = require("path");
const fsReal = require("fs");
const path = require("path");
const { getConnectionWsinventoryPool } = require("../lib/connection");

const result_success = "Success";
const result_failure = "Failure";

const templeAncestorSchema = Joi.object({
  id: Joi.number().integer().optional(),
  name: Joi.string().required(),
  photo_path: Joi.string().allow('', null).optional(),
  year_from: Joi.number().integer().allow('', null).optional(),
  year_to: Joi.number().integer().allow('', null).optional(),
  generation: Joi.string().allow('', null).optional(),
  gender: Joi.string().valid('male', 'female').default('male'),
  description: Joi.string().allow('', null).optional(),
  status: Joi.string().allow('', null).optional().default('active'),
  temple_details_id: Joi.number().integer().allow('', null).optional()
});

function saveBase64Image(base64Str, prefix = 'ancestor') {
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
    if (!fsReal.existsSync(uploadDir)) {
      fsReal.mkdirSync(uploadDir, { recursive: true });
    }
    fsReal.writeFileSync(path.join(uploadDir, filename), dataBuffer);
    return filename;
  } catch (err) {
    console.error(`Failed to save ${prefix} base64 image:`, err);
    return base64Str;
  }
}

const TempleAncestorsController = {
  CreateAncestor: (params, callback) => {
    const { error, value: validatedValue } = templeAncestorSchema.validate(params, { abortEarly: false });

    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(", ");
      return callback({ result: result_failure, code: 400, message: errorMessage }, null);
    }

    const savedPhoto = saveBase64Image(validatedValue.photo_path, 'ancestor');

    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const insertQuery = `
            INSERT INTO temple_ancestors 
            (name, photo_path, year_from, year_to, generation, gender, description, status, temple_details_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;
          const queryParams = [
            validatedValue.name,
            savedPhoto || null,
            validatedValue.year_from || null,
            validatedValue.year_to || null,
            validatedValue.generation || null,
            validatedValue.gender || 'male',
            validatedValue.description || null,
            validatedValue.status || 'active',
            validatedValue.temple_details_id || null
          ];

          const [result] = await client.query(insertQuery, queryParams);

          callback(null, { result: result_success, code: 200, message: "Ancestor added successfully", id: result.insertId, photo_path: savedPhoto });
        } catch (queryError) {
          callback({ result: result_failure, code: 400, message: queryError.message }, null);
        } finally {
          client.release();
        }
      });
    } catch (e) {
      callback({ result: result_failure, code: 400, message: e.message }, null);
    }
  },

  GetAncestors: (params, callback) => {
    let templeDetailsId = null;
    let cb = callback;
    if (typeof params === 'function') {
      cb = params;
    } else {
      templeDetailsId = params.temple_details_id;
    }

    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return cb({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          let query = "SELECT * FROM temple_ancestors";
          const queryParams = [];
          if (templeDetailsId) {
            query += " WHERE temple_details_id = ?";
            queryParams.push(templeDetailsId);
          }
          query += " ORDER BY id DESC";
          const [results] = await client.query(query, queryParams);
          cb(null, { result: result_success, code: 200, data: results });
        } catch (queryError) {
          cb({ result: result_failure, code: 400, message: queryError.message }, null);
        } finally {
          client.release();
        }
      });
    } catch (e) {
      cb({ result: result_failure, code: 400, message: e.message }, null);
    }
  },

  UpdateAncestor: (params, callback) => {
    if (!params.id) {
      return callback({ result: result_failure, code: 400, message: "\"id\" is required" }, null);
    }

    const { error, value: validatedValue } = templeAncestorSchema.validate(params, { abortEarly: false });

    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(", ");
      return callback({ result: result_failure, code: 400, message: errorMessage }, null);
    }

    const savedPhoto = saveBase64Image(validatedValue.photo_path, 'ancestor');

    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const queryParams = [
            validatedValue.name,
            validatedValue.year_from || null,
            validatedValue.year_to || null,
            validatedValue.generation || null,
            validatedValue.gender || 'male',
            validatedValue.description || null,
            validatedValue.status || 'active',
            validatedValue.temple_details_id || null
          ];

          let updateQuery = `
            UPDATE temple_ancestors
            SET name = ?, year_from = ?, year_to = ?, generation = ?, gender = ?, description = ?, status = ?, temple_details_id = ?
          `;

          if (savedPhoto !== undefined) {
            updateQuery += `, photo_path = ?`;
            queryParams.push(savedPhoto);
          }

          updateQuery += ` WHERE id = ?`;
          queryParams.push(validatedValue.id);

          await client.query(updateQuery, queryParams);

          callback(null, { result: result_success, code: 200, message: "Ancestor updated successfully", photo_path: savedPhoto });
        } catch (queryError) {
          callback({ result: result_failure, code: 400, message: queryError.message }, null);
        } finally {
          client.release();
        }
      });
    } catch (e) {
      callback({ result: result_failure, code: 400, message: e.message }, null);
    }
  },

  DeleteAncestor: (params, callback) => {
    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const deleteQuery = "DELETE FROM temple_ancestors WHERE id = ?";
          await client.query(deleteQuery, [params.id]);

          callback(null, { result: result_success, code: 200, message: "Ancestor deleted successfully" });
        } catch (queryError) {
          callback({ result: result_failure, code: 400, message: queryError.message }, null);
        } finally {
          client.release();
        }
      });
    } catch (e) {
      callback({ result: result_failure, code: 400, message: e.message }, null);
    }
  }
};

module.exports = TempleAncestorsController;
