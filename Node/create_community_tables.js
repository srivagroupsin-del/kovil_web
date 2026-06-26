const mysql = require('mysql2/promise');
require('dotenv').config();

async function init() {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('Connecting to database...');

    // 1. Create communities table
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS communities (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        community_name_tamil VARCHAR(255) NOT NULL,
        community_name_english VARCHAR(255) NOT NULL,
        title VARCHAR(255) DEFAULT NULL,
        info VARCHAR(500) DEFAULT NULL,
        description TEXT DEFAULT NULL,
        history TEXT DEFAULT NULL,
        image_path VARCHAR(255) DEFAULT NULL,
        status ENUM('active','inactive') DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Table "communities" created successfully');

    // 2. Create sub_communities table
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS sub_communities (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        community_id BIGINT NOT NULL,
        sub_community_name_tamil VARCHAR(255) NOT NULL,
        sub_community_name_english VARCHAR(255) NOT NULL,
        title VARCHAR(255) DEFAULT NULL,
        info VARCHAR(500) DEFAULT NULL,
        description TEXT DEFAULT NULL,
        history TEXT DEFAULT NULL,
        image_path VARCHAR(255) DEFAULT NULL,
        status ENUM('active','inactive') DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_sub_community
          FOREIGN KEY (community_id)
          REFERENCES communities(id)
          ON DELETE CASCADE
      )
    `);
    console.log('Table "sub_communities" created successfully');

    // 3. Create kulas table
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS kulas (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        community_id BIGINT NOT NULL,
        sub_community_id BIGINT NOT NULL,
        kula_name_tamil VARCHAR(255) NOT NULL,
        kula_name_english VARCHAR(255) NOT NULL,
        title VARCHAR(255) DEFAULT NULL,
        info VARCHAR(500) DEFAULT NULL,
        description TEXT DEFAULT NULL,
        history TEXT DEFAULT NULL,
        image_path VARCHAR(255) DEFAULT NULL,
        status ENUM('active','inactive') DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_kula_community
          FOREIGN KEY (community_id)
          REFERENCES communities(id)
          ON DELETE CASCADE,
        CONSTRAINT fk_kula_subcommunity
          FOREIGN KEY (sub_community_id)
          REFERENCES sub_communities(id)
          ON DELETE CASCADE
      )
    `);
    console.log('Table "kulas" created successfully');

    conn.end();
    console.log('Database tables setup complete.');
  } catch (err) {
    console.error('Error setting up tables:', err);
  }
}

init();
