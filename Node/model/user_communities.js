const Joi = require('joi');
const { getConnectionWsinventoryPool } = require('../lib/connection');

const userCommunitySchema = Joi.object({
  user_id: Joi.alternatives().try(Joi.number().integer(), Joi.string()).required(),
  user_main_id: Joi.string().allow('', null).optional(),
  sector_title_id: Joi.alternatives().try(Joi.number().integer(), Joi.string()).required(),
  sector_title_name: Joi.string().allow('', null).optional(),
  sector_id: Joi.alternatives().try(Joi.number().integer(), Joi.string()).required(),
  sector_name: Joi.string().allow('', null).optional(),
  sub_sector_id: Joi.alternatives().try(Joi.number().integer(), Joi.string()).required(),
  sub_sector_name: Joi.string().allow('', null).optional(),
  primary_category_ids: Joi.array().items(Joi.alternatives().try(Joi.number().integer(), Joi.string())).optional().default([]),
  sub_category_ids: Joi.array().items(Joi.alternatives().try(Joi.number().integer(), Joi.string())).optional().default([]),
});

class UserCommunityController {
  async CreateUserCommunity(req, res) {
    try {
      const { error, value } = userCommunitySchema.validate(req.body);
      if (error) {
        return res.status(400).json({ code: 400, message: error.details[0].message });
      }
      
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return res.status(500).json({ code: 500, message: "Database connection error" });
        try {
          // Create user_community_mapping table
          await client.query(`
            CREATE TABLE IF NOT EXISTS user_community_mapping (
              id BIGINT AUTO_INCREMENT PRIMARY KEY,
              user_id BIGINT NOT NULL,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
          `);

          // Alter table to add user_main_id column if it doesn't exist
          const [userMainIdCols] = await client.query("SHOW COLUMNS FROM user_community_mapping LIKE 'user_main_id'");
          if (userMainIdCols.length === 0) {
            await client.query("ALTER TABLE user_community_mapping ADD COLUMN user_main_id VARCHAR(255) NULL AFTER user_id");
          }

          // Alter table to add sector_title_id if it doesn't exist
          const [titleIdCols] = await client.query("SHOW COLUMNS FROM user_community_mapping LIKE 'sector_title_id'");
          if (titleIdCols.length === 0) {
            await client.query("ALTER TABLE user_community_mapping ADD COLUMN sector_title_id BIGINT NOT NULL AFTER user_main_id");
          }

          // Alter table to add name columns if they don't exist
          const [titleCols] = await client.query("SHOW COLUMNS FROM user_community_mapping LIKE 'sector_title_name'");
          if (titleCols.length === 0) {
            await client.query("ALTER TABLE user_community_mapping ADD COLUMN sector_title_name VARCHAR(255) NULL AFTER sector_title_id");
          }

          // Alter table to add sector_id if it doesn't exist
          const [sectorIdCols] = await client.query("SHOW COLUMNS FROM user_community_mapping LIKE 'sector_id'");
          if (sectorIdCols.length === 0) {
            await client.query("ALTER TABLE user_community_mapping ADD COLUMN sector_id BIGINT NOT NULL AFTER sector_title_name");
          }

          const [sectorCols] = await client.query("SHOW COLUMNS FROM user_community_mapping LIKE 'sector_name'");
          if (sectorCols.length === 0) {
            await client.query("ALTER TABLE user_community_mapping ADD COLUMN sector_name VARCHAR(255) NULL AFTER sector_id");
          }

          // Alter table to add sub_sector_id if it doesn't exist
          const [subSectorIdCols] = await client.query("SHOW COLUMNS FROM user_community_mapping LIKE 'sub_sector_id'");
          if (subSectorIdCols.length === 0) {
            await client.query("ALTER TABLE user_community_mapping ADD COLUMN sub_sector_id BIGINT NOT NULL AFTER sector_name");
          }

          const [subSectorCols] = await client.query("SHOW COLUMNS FROM user_community_mapping LIKE 'sub_sector_name'");
          if (subSectorCols.length === 0) {
            await client.query("ALTER TABLE user_community_mapping ADD COLUMN sub_sector_name VARCHAR(255) NULL AFTER sub_sector_id");
          }

          // Create user_primary_categories table
          await client.query(`
            CREATE TABLE IF NOT EXISTS user_primary_categories (
              id BIGINT AUTO_INCREMENT PRIMARY KEY,
              user_id BIGINT NOT NULL,
              primary_category_id BIGINT NOT NULL,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              INDEX idx_user_id (user_id)
            )
          `);

          // Create user_sub_categories table
          await client.query(`
            CREATE TABLE IF NOT EXISTS user_sub_categories (
              id BIGINT AUTO_INCREMENT PRIMARY KEY,
              user_id BIGINT NOT NULL,
              sub_category_id BIGINT NOT NULL,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              INDEX idx_user_id (user_id)
            )
          `);

          // Clear previous mappings for this user to avoid duplicates
          await client.query("DELETE FROM user_community_mapping WHERE user_id = ?", [value.user_id]);
          await client.query("DELETE FROM user_primary_categories WHERE user_id = ?", [value.user_id]);
          await client.query("DELETE FROM user_sub_categories WHERE user_id = ?", [value.user_id]);

          // Insert into main mapping table
          const [result] = await client.query(`
            INSERT INTO user_community_mapping (user_id, user_main_id, sector_title_id, sector_title_name, sector_id, sector_name, sub_sector_id, sub_sector_name)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            value.user_id,
            value.user_main_id || null,
            value.sector_title_id,
            value.sector_title_name || null,
            value.sector_id,
            value.sector_name || null,
            value.sub_sector_id,
            value.sub_sector_name || null
          ]);

          // Insert into primary categories table
          if (value.primary_category_ids && value.primary_category_ids.length > 0) {
            const primaryInsertQuery = `
              INSERT INTO user_primary_categories (user_id, primary_category_id)
              VALUES ?
            `;
            const primaryValues = value.primary_category_ids.map(id => [value.user_id, id]);
            await client.query(primaryInsertQuery, [primaryValues]);
          }

          // Insert into sub categories table
          if (value.sub_category_ids && value.sub_category_ids.length > 0) {
            const subInsertQuery = `
              INSERT INTO user_sub_categories (user_id, sub_category_id)
              VALUES ?
            `;
            const subValues = value.sub_category_ids.map(id => [value.user_id, id]);
            await client.query(subInsertQuery, [subValues]);
          }
          
          res.status(200).json({ code: 200, message: "User community mapping created successfully", insertId: result.insertId });
        } catch (dbErr) {
          res.status(500).json({ code: 500, message: dbErr.message });
        } finally {
          client.release();
        }
      });
    } catch (err) {
      res.status(500).json({ code: 500, message: err.message });
    }
  }

  async GetUserCommunities(req, res) {
    try {
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return res.status(500).json({ code: 500, message: "Database connection error" });
        try {
          // Ensure tables exist before querying
          await client.query(`
            CREATE TABLE IF NOT EXISTS user_community_mapping (
              id BIGINT AUTO_INCREMENT PRIMARY KEY,
              user_id BIGINT NOT NULL,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
          `);

          // Alter table to add user_main_id column if it doesn't exist
          const [userMainIdCols] = await client.query("SHOW COLUMNS FROM user_community_mapping LIKE 'user_main_id'");
          if (userMainIdCols.length === 0) {
            await client.query("ALTER TABLE user_community_mapping ADD COLUMN user_main_id VARCHAR(255) NULL AFTER user_id");
          }

          // Alter table to add sector_title_id if it doesn't exist
          const [titleIdCols] = await client.query("SHOW COLUMNS FROM user_community_mapping LIKE 'sector_title_id'");
          if (titleIdCols.length === 0) {
            await client.query("ALTER TABLE user_community_mapping ADD COLUMN sector_title_id BIGINT NOT NULL AFTER user_main_id");
          }

          // Alter table to add name columns if they don't exist
          const [titleCols] = await client.query("SHOW COLUMNS FROM user_community_mapping LIKE 'sector_title_name'");
          if (titleCols.length === 0) {
            await client.query("ALTER TABLE user_community_mapping ADD COLUMN sector_title_name VARCHAR(255) NULL AFTER sector_title_id");
          }

          // Alter table to add sector_id if it doesn't exist
          const [sectorIdCols] = await client.query("SHOW COLUMNS FROM user_community_mapping LIKE 'sector_id'");
          if (sectorIdCols.length === 0) {
            await client.query("ALTER TABLE user_community_mapping ADD COLUMN sector_id BIGINT NOT NULL AFTER sector_title_name");
          }

          const [sectorCols] = await client.query("SHOW COLUMNS FROM user_community_mapping LIKE 'sector_name'");
          if (sectorCols.length === 0) {
            await client.query("ALTER TABLE user_community_mapping ADD COLUMN sector_name VARCHAR(255) NULL AFTER sector_id");
          }

          // Alter table to add sub_sector_id if it doesn't exist
          const [subSectorIdCols] = await client.query("SHOW COLUMNS FROM user_community_mapping LIKE 'sub_sector_id'");
          if (subSectorIdCols.length === 0) {
            await client.query("ALTER TABLE user_community_mapping ADD COLUMN sub_sector_id BIGINT NOT NULL AFTER sector_name");
          }

          const [subSectorCols] = await client.query("SHOW COLUMNS FROM user_community_mapping LIKE 'sub_sector_name'");
          if (subSectorCols.length === 0) {
            await client.query("ALTER TABLE user_community_mapping ADD COLUMN sub_sector_name VARCHAR(255) NULL AFTER sub_sector_id");
          }

          await client.query(`
            CREATE TABLE IF NOT EXISTS user_primary_categories (
              id BIGINT AUTO_INCREMENT PRIMARY KEY,
              user_id BIGINT NOT NULL,
              primary_category_id BIGINT NOT NULL,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              INDEX idx_user_id (user_id)
            )
          `);

          await client.query(`
            CREATE TABLE IF NOT EXISTS user_sub_categories (
              id BIGINT AUTO_INCREMENT PRIMARY KEY,
              user_id BIGINT NOT NULL,
              sub_category_id BIGINT NOT NULL,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              INDEX idx_user_id (user_id)
            )
          `);

          // Fetch mappings with concatenated lists of primary and sub category IDs
          const query = `
            SELECT 
              m.id,
              m.user_id,
              m.user_main_id,
              m.sector_title_id,
              m.sector_title_name,
              m.sector_id,
              m.sector_name,
              m.sub_sector_id,
              m.sub_sector_name,
              m.created_at,
              m.updated_at,
              (SELECT GROUP_CONCAT(primary_category_id) FROM user_primary_categories WHERE user_id = m.user_id) AS primary_category_ids,
              (SELECT GROUP_CONCAT(sub_category_id) FROM user_sub_categories WHERE user_id = m.user_id) AS sub_category_ids
            FROM user_community_mapping m
            ORDER BY m.id DESC
          `;
          const [rows] = await client.query(query);

          // Convert concatenated ID strings back to number arrays
          const formattedRows = rows.map(row => ({
            ...row,
            primary_category_ids: row.primary_category_ids ? row.primary_category_ids.split(',').map(Number) : [],
            sub_category_ids: row.sub_category_ids ? row.sub_category_ids.split(',').map(Number) : []
          }));
          
          res.status(200).json({ code: 200, data: formattedRows });
        } catch (dbErr) {
          res.status(500).json({ code: 500, message: dbErr.message });
        } finally {
          client.release();
        }
      });
    } catch (err) {
      res.status(500).json({ code: 500, message: err.message });
    }
  }
  
  async DeleteUserCommunity(req, res) {
    try {
      const id = req.params.id;
      getConnectionWsinventoryPool(async (err, client) => {
        if (err) return res.status(500).json({ code: 500, message: "Database connection error" });
        try {
          // Retrieve user_id associated with mapping before deletion
          const [rows] = await client.query('SELECT user_id FROM user_community_mapping WHERE id = ?', [id]);
          if (rows.length > 0) {
            const userId = rows[0].user_id;
            await client.query('DELETE FROM user_community_mapping WHERE id = ?', [id]);
            await client.query('DELETE FROM user_primary_categories WHERE user_id = ?', [userId]);
            await client.query('DELETE FROM user_sub_categories WHERE user_id = ?', [userId]);
          }
          res.status(200).json({ code: 200, message: "Deleted successfully" });
        } catch (dbErr) {
          res.status(500).json({ code: 500, message: dbErr.message });
        } finally {
          client.release();
        }
      });
    } catch (err) {
      res.status(500).json({ code: 500, message: err.message });
    }
  }
}

module.exports = UserCommunityController;
