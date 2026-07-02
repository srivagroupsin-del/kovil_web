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

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS temple_ancestors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        photo_path VARCHAR(255) NULL,
        year_from INT NULL,
        year_to INT NULL,
        generation VARCHAR(50) NULL,
        gender ENUM('male', 'female') NOT NULL DEFAULT 'male',
        description TEXT NULL,
        status VARCHAR(50) DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    console.log('Table temple_ancestors created successfully');
    conn.end();
  } catch (err) {
    console.error(err);
  }
}

init();
