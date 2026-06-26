const Joi = require("joi");
const winston = require("winston");
const { getConnectionWsinventoryPool } = require("../lib/connection");

const result_success = "Success";
const result_failure = "Failure";

const templeBasicDetailSchema = Joi.object({
  country: Joi.string().allow('', null).optional(),
  district: Joi.string().allow('', null).optional(),
  mulavar_name: Joi.string().allow('', null).optional(),
  pincode: Joi.string().allow('', null).optional(),
  state: Joi.string().allow('', null).optional(),
  temple_name: Joi.string().allow('', null).optional(),
  village_name: Joi.string().allow('', null).optional(),
  id: Joi.number().integer().optional(),
  
  // Community Mapping Fields
  sector_title_id: Joi.alternatives().try(Joi.number().integer(), Joi.string()).optional(),
  sector_title_name: Joi.string().allow('', null).optional(),
  sector_id: Joi.alternatives().try(Joi.number().integer(), Joi.string()).optional(),
  sector_name: Joi.string().allow('', null).optional(),
  sub_sector_id: Joi.alternatives().try(Joi.number().integer(), Joi.string()).optional(),
  sub_sector_name: Joi.string().allow('', null).optional(),
  primary_category_ids: Joi.array().items(Joi.alternatives().try(Joi.number().integer(), Joi.string())).optional().default([]),
  sub_category_ids: Joi.array().items(Joi.alternatives().try(Joi.number().integer(), Joi.string())).optional().default([]),
});

const deleteSchema = Joi.object({
  id: Joi.number().integer().required(),
});

const TempleBasicDetailsController = (function () {
  
  const _createTempleBasicDetail = async (jsonValue, callback) => {
    const { error, value } = templeBasicDetailSchema.validate(jsonValue);

    if (error) {
      return callback(
        { result: result_failure, code: 400, message: error.message },
        null,
      );
    }

    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) {
          return callback(
            {
              result: result_failure,
              code: 500,
              message: "Database connection error",
            },
            null,
          );
        }

        try {
          // Dynamic Tables Creation
          await client.query(`
            CREATE TABLE IF NOT EXISTS temple_community_mapping (
              id BIGINT AUTO_INCREMENT PRIMARY KEY,
              temple_id BIGINT NOT NULL,
              sector_title_id BIGINT NOT NULL,
              sector_title_name VARCHAR(255) NULL,
              sector_id BIGINT NOT NULL,
              sector_name VARCHAR(255) NULL,
              sub_sector_id BIGINT NOT NULL,
              sub_sector_name VARCHAR(255) NULL,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
          `);

          await client.query(`
            CREATE TABLE IF NOT EXISTS temple_primary_categories (
              id BIGINT AUTO_INCREMENT PRIMARY KEY,
              temple_id BIGINT NOT NULL,
              primary_category_id BIGINT NOT NULL,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              INDEX idx_temple_id (temple_id)
            )
          `);

          await client.query(`
            CREATE TABLE IF NOT EXISTS temple_sub_categories (
              id BIGINT AUTO_INCREMENT PRIMARY KEY,
              temple_id BIGINT NOT NULL,
              sub_category_id BIGINT NOT NULL,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              INDEX idx_temple_id (temple_id)
            )
          `);

          // Insert into main temple_basic_details
          const insertQuery = `
            INSERT INTO temple_basic_details
            (country, district, mulavar_name, pincode, state, temple_name, village_name)
            VALUES
            (?,?,?,?,?,?,?)
          `;

          const [result] = await client.query(insertQuery, [
            value.country || null,
            value.district || null,
            value.mulavar_name || null,
            value.pincode || null,
            value.state || null,
            value.temple_name || null,
            value.village_name || null,
          ]);

          const insertId = result.insertId;

          // Insert community mapping if provided
          if (value.sector_title_id && value.sector_id && value.sub_sector_id) {
            await client.query(`
              INSERT INTO temple_community_mapping 
              (temple_id, sector_title_id, sector_title_name, sector_id, sector_name, sub_sector_id, sub_sector_name)
              VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [
              insertId,
              value.sector_title_id,
              value.sector_title_name || null,
              value.sector_id,
              value.sector_name || null,
              value.sub_sector_id,
              value.sub_sector_name || null
            ]);
          }

          // Insert primary categories if provided
          if (value.primary_category_ids && value.primary_category_ids.length > 0) {
            const primaryInsertQuery = `
              INSERT INTO temple_primary_categories (temple_id, primary_category_id)
              VALUES ?
            `;
            const primaryValues = value.primary_category_ids.map(id => [insertId, id]);
            await client.query(primaryInsertQuery, [primaryValues]);
          }

          // Insert sub categories if provided
          if (value.sub_category_ids && value.sub_category_ids.length > 0) {
            const subInsertQuery = `
              INSERT INTO temple_sub_categories (temple_id, sub_category_id)
              VALUES ?
            `;
            const subValues = value.sub_category_ids.map(id => [insertId, id]);
            await client.query(subInsertQuery, [subValues]);
          }

          callback(null, {
            result: result_success,
            code: 200,
            message: "Temple basic detail created successfully",
            data: { id: insertId },
          });
        } catch (queryError) {
          callback(
            { result: result_failure, code: 400, message: queryError.message },
            null,
          );
        } finally {
          client.release();
        }
      });
    } catch (err) {
      callback(
        { result: result_failure, code: 500, message: "Internal server error" },
        null,
      );
    }
  };

  const _getTempleBasicDetails = async (callback) => {
    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) {
          return callback(
            {
              result: result_failure,
              code: 500,
              message: "Database connection error",
            },
            null,
          );
        }

        try {
          // Dynamic table check before selecting
          await client.query(`
            CREATE TABLE IF NOT EXISTS temple_community_mapping (
              id BIGINT AUTO_INCREMENT PRIMARY KEY,
              temple_id BIGINT NOT NULL,
              sector_title_id BIGINT NOT NULL,
              sector_title_name VARCHAR(255) NULL,
              sector_id BIGINT NOT NULL,
              sector_name VARCHAR(255) NULL,
              sub_sector_id BIGINT NOT NULL,
              sub_sector_name VARCHAR(255) NULL,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
          `);

          const query = `
            SELECT 
              t.id, t.country, t.district, t.mulavar_name, t.pincode, t.state, t.temple_name, t.village_name,
              m.sector_title_id, m.sector_title_name, m.sector_id, m.sector_name, m.sub_sector_id, m.sub_sector_name,
              (SELECT GROUP_CONCAT(primary_category_id) FROM temple_primary_categories WHERE temple_id = t.id) AS primary_category_ids,
              (SELECT GROUP_CONCAT(sub_category_id) FROM temple_sub_categories WHERE temple_id = t.id) AS sub_category_ids
            FROM temple_basic_details t
            LEFT JOIN temple_community_mapping m ON m.temple_id = t.id
            ORDER BY t.id DESC;
          `;
          const [rows] = await client.query(query);

          const formattedRows = rows.map(row => ({
            ...row,
            primary_category_ids: row.primary_category_ids ? row.primary_category_ids.split(',').map(Number) : [],
            sub_category_ids: row.sub_category_ids ? row.sub_category_ids.split(',').map(Number) : []
          }));

          callback(null, {
            result: result_success,
            code: 200,
            data: formattedRows,
          });
        } catch (queryError) {
          callback(
            { result: result_failure, code: 400, message: queryError.message },
            null,
          );
        } finally {
          client.release();
        }
      });
    } catch (err) {
      callback(
        { result: result_failure, code: 500, message: "Internal server error" },
        null,
      );
    }
  };

  const _getTempleBasicDetailById = async (id, callback) => {
    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) {
          return callback(
            {
              result: result_failure,
              code: 500,
              message: "Database connection error",
            },
            null,
          );
        }

        try {
          // Dynamic table check before selecting
          await client.query(`
            CREATE TABLE IF NOT EXISTS temple_community_mapping (
              id BIGINT AUTO_INCREMENT PRIMARY KEY,
              temple_id BIGINT NOT NULL,
              sector_title_id BIGINT NOT NULL,
              sector_title_name VARCHAR(255) NULL,
              sector_id BIGINT NOT NULL,
              sector_name VARCHAR(255) NULL,
              sub_sector_id BIGINT NOT NULL,
              sub_sector_name VARCHAR(255) NULL,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
          `);

          const query = `
            SELECT 
              t.id, t.country, t.district, t.mulavar_name, t.pincode, t.state, t.temple_name, t.village_name,
              m.sector_title_id, m.sector_title_name, m.sector_id, m.sector_name, m.sub_sector_id, m.sub_sector_name,
              (SELECT GROUP_CONCAT(primary_category_id) FROM temple_primary_categories WHERE temple_id = t.id) AS primary_category_ids,
              (SELECT GROUP_CONCAT(sub_category_id) FROM temple_sub_categories WHERE temple_id = t.id) AS sub_category_ids
            FROM temple_basic_details t
            LEFT JOIN temple_community_mapping m ON m.temple_id = t.id
            WHERE t.id = ?
          `;
          const [rows] = await client.query(query, [id]);
          if (rows.length === 0) {
            return callback(
              {
                result: result_failure,
                code: 404,
                message: "Temple basic detail not found",
              },
              null,
            );
          }

          const row = rows[0];
          const formattedRow = {
            ...row,
            primary_category_ids: row.primary_category_ids ? row.primary_category_ids.split(',').map(Number) : [],
            sub_category_ids: row.sub_category_ids ? row.sub_category_ids.split(',').map(Number) : []
          };

          callback(null, {
            result: result_success,
            code: 200,
            data: formattedRow,
          });
        } catch (queryError) {
          callback(
            { result: result_failure, code: 400, message: queryError.message },
            null,
          );
        } finally {
          client.release();
        }
      });
    } catch (err) {
      callback(
        { result: result_failure, code: 500, message: "Internal server error" },
        null,
      );
    }
  };

  const _updateTempleBasicDetail = async (jsonValue, callback) => {
    const { error, value } = templeBasicDetailSchema.validate(jsonValue);
    if (error) {
      return callback(
        { result: result_failure, code: 400, message: error.message },
        null,
      );
    }

    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) {
          return callback(
            {
              result: result_failure,
              code: 500,
              message: "Database connection error",
            },
            null,
          );
        }

        try {
          const checkQuery = `SELECT id FROM temple_basic_details WHERE id = ?`;
          const [checkResult] = await client.query(checkQuery, [value.id]);
          if (checkResult.length === 0) {
            return callback(
              {
                result: result_failure,
                code: 404,
                message: "Temple basic detail not found",
              },
              null,
            );
          }

          // Update main details
          const updateQuery = `
            UPDATE temple_basic_details
            SET country = ?, district = ?, mulavar_name = ?, pincode = ?, state = ?, temple_name = ?, village_name = ?
            WHERE id = ?
          `;
          await client.query(updateQuery, [
            value.country || null,
            value.district || null,
            value.mulavar_name || null,
            value.pincode || null,
            value.state || null,
            value.temple_name || null,
            value.village_name || null,
            value.id,
          ]);

          // Clear previous community mappings for this temple
          await client.query("DELETE FROM temple_community_mapping WHERE temple_id = ?", [value.id]);
          await client.query("DELETE FROM temple_primary_categories WHERE temple_id = ?", [value.id]);
          await client.query("DELETE FROM temple_sub_categories WHERE temple_id = ?", [value.id]);

          // Insert new mapping if provided
          if (value.sector_title_id && value.sector_id && value.sub_sector_id) {
            await client.query(`
              INSERT INTO temple_community_mapping 
              (temple_id, sector_title_id, sector_title_name, sector_id, sector_name, sub_sector_id, sub_sector_name)
              VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [
              value.id,
              value.sector_title_id,
              value.sector_title_name || null,
              value.sector_id,
              value.sector_name || null,
              value.sub_sector_id,
              value.sub_sector_name || null
            ]);
          }

          // Insert primary categories if provided
          if (value.primary_category_ids && value.primary_category_ids.length > 0) {
            const primaryInsertQuery = `
              INSERT INTO temple_primary_categories (temple_id, primary_category_id)
              VALUES ?
            `;
            const primaryValues = value.primary_category_ids.map(id => [value.id, id]);
            await client.query(primaryInsertQuery, [primaryValues]);
          }

          // Insert sub categories if provided
          if (value.sub_category_ids && value.sub_category_ids.length > 0) {
            const subInsertQuery = `
              INSERT INTO temple_sub_categories (temple_id, sub_category_id)
              VALUES ?
            `;
            const subValues = value.sub_category_ids.map(id => [value.id, id]);
            await client.query(subInsertQuery, [subValues]);
          }

          callback(null, {
            result: result_success,
            code: 200,
            message: "Temple basic detail updated successfully",
          });
        } catch (queryError) {
          callback(
            { result: result_failure, code: 400, message: queryError.message },
            null,
          );
        } finally {
          client.release();
        }
      });
    } catch (err) {
      callback(
        { result: result_failure, code: 500, message: "Internal server error" },
        null,
      );
    }
  };

  const _deleteTempleBasicDetail = async (jsonValue, callback) => {
    const { error, value } = deleteSchema.validate(jsonValue);
    if (error) {
      return callback(
        { result: result_failure, code: 400, message: error.message },
        null,
      );
    }

    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) {
          return callback(
            {
              result: result_failure,
              code: 500,
              message: "Database connection error",
            },
            null,
          );
        }

        try {
          const checkQuery = `SELECT id FROM temple_basic_details WHERE id = ?`;
          const [checkResult] = await client.query(checkQuery, [value.id]);
          if (checkResult.length === 0) {
            return callback(
              {
                result: result_failure,
                code: 404,
                message: "Temple basic detail not found",
              },
              null,
            );
          }

          // Delete from main and sub tables
          const deleteQuery = `DELETE FROM temple_basic_details WHERE id = ?`;
          await client.query(deleteQuery, [value.id]);

          await client.query("DELETE FROM temple_community_mapping WHERE temple_id = ?", [value.id]);
          await client.query("DELETE FROM temple_primary_categories WHERE temple_id = ?", [value.id]);
          await client.query("DELETE FROM temple_sub_categories WHERE temple_id = ?", [value.id]);

          callback(null, {
            result: result_success,
            code: 200,
            message: "Temple basic detail deleted successfully",
          });
        } catch (queryError) {
          callback(
            { result: result_failure, code: 400, message: queryError.message },
            null,
          );
        } finally {
          client.release();
        }
      });
    } catch (err) {
      callback(
        { result: result_failure, code: 500, message: "Internal server error" },
        null,
      );
    }
  };

  return {
    CreateTempleBasicDetail: _createTempleBasicDetail,
    GetTempleBasicDetails: _getTempleBasicDetails,
    GetTempleBasicDetailById: _getTempleBasicDetailById,
    UpdateTempleBasicDetail: _updateTempleBasicDetail,
    DeleteTempleBasicDetail: _deleteTempleBasicDetail,
  };
})();

module.exports = TempleBasicDetailsController;
