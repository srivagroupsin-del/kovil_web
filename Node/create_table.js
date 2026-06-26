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
      CREATE TABLE IF NOT EXISTS donors_volunteers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        temple_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        type ENUM('Donor', 'Volunteer', 'Both') NOT NULL DEFAULT 'Donor',
        donation_details TEXT,
        assigned_service TEXT,
        photo_path VARCHAR(255),
        status VARCHAR(50) DEFAULT 'active',
        created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    console.log('Table created successfully');
    conn.end();
  } catch (err) {
    console.error(err);
  }
}

init();
