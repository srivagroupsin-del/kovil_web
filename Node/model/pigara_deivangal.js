const Joi = require("joi");
const { getConnectionWsinventoryPool } = require("../lib/connection");

const result_success = "Success";
const result_failure = "Failure";

const pigaraDeivangalSchema = Joi.object({
  id: Joi.number().integer().optional(),
  name: Joi.string().required(),
  deitySpeciality: Joi.string().allow('', null).optional(),
  worshipMethod: Joi.string().allow('', null).optional(),
  prayerRequest: Joi.string().allow('', null).optional(),
  notes: Joi.string().allow('', null).optional(),
  specialName: Joi.string().allow('', null).optional(),
  specialDays: Joi.string().allow('', null).optional(),
  specialPuja: Joi.string().allow('', null).optional(),
  fastings: Joi.string().allow('', null).optional(),
  separateSannidhi: Joi.alternatives().try(Joi.boolean(), Joi.number().valid(0, 1)).allow(null).optional(),
  deivamType: Joi.string().allow('', null).optional(),
  status: Joi.string().allow('', null).optional(),
  templeId: Joi.number().integer().optional(),
  
  // Snake case equivalents
  deity_speciality: Joi.string().allow('', null).optional(),
  worship_method: Joi.string().allow('', null).optional(),
  prayer_request: Joi.string().allow('', null).optional(),
  special_name: Joi.string().allow('', null).optional(),
  special_days: Joi.string().allow('', null).optional(),
  special_puja: Joi.string().allow('', null).optional(),
  separate_sannidhi: Joi.alternatives().try(Joi.boolean(), Joi.number().valid(0, 1)).allow(null).optional(),
  deivam_type: Joi.string().allow('', null).optional(),
  temple_id: Joi.number().integer().optional(),
  photo: Joi.string().allow('', null).optional(),
  created_date: Joi.date().allow('', null).optional(),
  updated_date: Joi.date().allow('', null).optional(),
});

const deleteSchema = Joi.object({
  id: Joi.number().integer().required(),
});

const mapToCamel = (row) => {
  return {
    id: row.id,
    name: row.name,
    deitySpeciality: row.deity_speciality,
    worshipMethod: row.worship_method,
    prayerRequest: row.prayer_request,
    notes: row.notes,
    specialName: row.special_name,
    specialDays: row.special_days,
    specialPuja: row.special_puja,
    fastings: row.fastings,
    separateSannidhi: row.separate_sannidhi !== null ? (row.separate_sannidhi instanceof Buffer ? row.separate_sannidhi[0] === 1 : !!row.separate_sannidhi) : null,
    deivamType: row.deivam_type,
    status: row.status,
    templeId: row.temple_id,
    photo: row.photo,
    createdDate: row.created_date,
    updatedDate: row.updated_date
  };
};

const PigaraDeivangalController = (function () {

  const _createPigaraDeivangal = async (jsonValue, callback) => {
    const { error, value } = pigaraDeivangalSchema.validate(jsonValue);

    if (error) {
      return callback({ result: result_failure, code: 400, message: error.message }, null);
    }

    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const insertQuery = `
          INSERT INTO pigara_deivangal
          (created_date, deity_speciality, deivam_type, fastings, name, notes, photo, prayer_request, separate_sannidhi, special_days, special_name, special_puja, status, updated_date, worship_method, temple_id)
          VALUES
          (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        `;

          const [result] = await client.query(insertQuery, [
            value.created_date ? new Date(value.created_date) : new Date(),
            value.deity_speciality || value.deitySpeciality || null,
            value.deivam_type || value.deivamType || null,
            value.fastings || null,
            value.name,
            value.notes || null,
            value.photo || null,
            value.prayer_request || value.prayerRequest || null,
            value.separate_sannidhi !== undefined ? value.separate_sannidhi : (value.separateSannidhi !== undefined ? value.separateSannidhi : null),
            value.special_days || value.specialDays || null,
            value.special_name || value.specialName || null,
            value.special_puja || value.specialPuja || null,
            value.status || 'Active',
            value.updated_date ? new Date(value.updated_date) : new Date(),
            value.worship_method || value.worshipMethod || null,
            value.temple_id || value.templeId || 1
          ]);

          callback(null, {
            result: result_success,
            code: 200,
            message: "Pigara Deivangal created successfully",
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

  const _getPigaraDeivangal = async (callback) => {
    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const query = `
            SELECT id, created_date, deity_speciality, deivam_type, fastings, name, notes, photo, prayer_request, separate_sannidhi, special_days, special_name, special_puja, status, updated_date, worship_method, temple_id
            FROM pigara_deivangal
            ORDER BY id DESC;
          `;
          const [rows] = await client.query(query);
          const formattedRows = rows.map(mapToCamel);
          callback(null, { result: result_success, code: 200, data: formattedRows });
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

  const _getPigaraDeivangalById = async (id, callback) => {
    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const query = `
            SELECT id, created_date, deity_speciality, deivam_type, fastings, name, notes, photo, prayer_request, separate_sannidhi, special_days, special_name, special_puja, status, updated_date, worship_method, temple_id
            FROM pigara_deivangal
            WHERE id = ?
          `;
          const [rows] = await client.query(query, [id]);
          if (rows.length === 0) return callback({ result: result_failure, code: 404, message: "Pigara Deivangal not found" }, null);
          
          callback(null, { result: result_success, code: 200, data: mapToCamel(rows[0]) });
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

  const _getPigaraDeivangalByTempleId = async (temple_id, callback) => {
    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const query = `
            SELECT id, created_date, deity_speciality, deivam_type, fastings, name, notes, photo, prayer_request, separate_sannidhi, special_days, special_name, special_puja, status, updated_date, worship_method, temple_id
            FROM pigara_deivangal
            WHERE temple_id = ?
          `;
          const [rows] = await client.query(query, [temple_id]);
          const formattedRows = rows.map(mapToCamel);
          callback(null, { result: result_success, code: 200, data: formattedRows });
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

  const _updatePigaraDeivangal = async (jsonValue, callback) => {
    const { error, value } = pigaraDeivangalSchema.validate(jsonValue);
    if (error) return callback({ result: result_failure, code: 400, message: error.message }, null);

    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const checkQuery = `SELECT id FROM pigara_deivangal WHERE id = ?`;
          const [checkResult] = await client.query(checkQuery, [value.id]);
          if (checkResult.length === 0) return callback({ result: result_failure, code: 404, message: "Pigara Deivangal not found" }, null);

          const updateQuery = `
            UPDATE pigara_deivangal
            SET deity_speciality = ?, deivam_type = ?, fastings = ?, name = ?, notes = ?, 
                photo = COALESCE(?, photo), 
                prayer_request = ?, relationship = ?, relationship_status = ?, separate_sannidhi = ?, 
                special_days = ?, special_name = ?, special_puja = ?, status = ?, updated_date = ?, 
                worship_method = ?, temple_id = ?
            WHERE id = ?
          `;

          await client.query(updateQuery, [
            value.deity_speciality || value.deitySpeciality || null,
            value.deivam_type || value.deivamType || null,
            value.fastings || null,
            value.name,
            value.notes || null,
            value.photo || null,
            value.prayer_request || value.prayerRequest || null,
            value.relationship || null,
            value.relationship_status || null,
            value.separate_sannidhi !== undefined ? value.separate_sannidhi : (value.separateSannidhi !== undefined ? value.separateSannidhi : null),
            value.special_days || value.specialDays || null,
            value.special_name || value.specialName || null,
            value.special_puja || value.specialPuja || null,
            value.status || 'Active',
            value.updated_date ? new Date(value.updated_date) : new Date(),
            value.worship_method || value.worshipMethod || null,
            value.temple_id || value.templeId || 1,
            value.id,
          ]);

          callback(null, { result: result_success, code: 200, message: "Pigara Deivangal updated successfully" });
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

  const _deletePigaraDeivangal = async (jsonValue, callback) => {
    const { error, value } = deleteSchema.validate(jsonValue);
    if (error) return callback({ result: result_failure, code: 400, message: error.message }, null);

    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return callback({ result: result_failure, code: 500, message: "Database connection error" }, null);

        try {
          const checkQuery = `SELECT id FROM pigara_deivangal WHERE id = ?`;
          const [checkResult] = await client.query(checkQuery, [value.id]);
          if (checkResult.length === 0) return callback({ result: result_failure, code: 404, message: "Pigara Deivangal not found" }, null);

          const deleteQuery = `DELETE FROM pigara_deivangal WHERE id = ?`;
          await client.query(deleteQuery, [value.id]);

          callback(null, { result: result_success, code: 200, message: "Pigara Deivangal deleted successfully" });
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
    CreatePigaraDeivangal: _createPigaraDeivangal,
    GetPigaraDeivangal: _getPigaraDeivangal,
    GetPigaraDeivangalById: _getPigaraDeivangalById,
    GetPigaraDeivangalByTempleId: _getPigaraDeivangalByTempleId,
    UpdatePigaraDeivangal: _updatePigaraDeivangal,
    DeletePigaraDeivangal: _deletePigaraDeivangal,
  };
})();

module.exports = PigaraDeivangalController;
