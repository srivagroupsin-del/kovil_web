const mysql = require('mysql2/promise');
mysql.createConnection({host: '127.0.0.1', user: 'root', database: 'temple_data'})
  .then(async c => { 
    await c.query(`
      CREATE TABLE IF NOT EXISTS community_kula_deivam (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        community VARCHAR(255) NOT NULL,
        sub_caste VARCHAR(255) DEFAULT NULL,
        kula_deivam_name VARCHAR(255) NOT NULL,
        deity_type ENUM('moolavar', 'parivara_deivam', 'uba_deivam', 'pigara_deivam', 'bali_deivam', 'kaval_deivam') DEFAULT 'moolavar',
        temple_name VARCHAR(255) DEFAULT NULL,
        village_name VARCHAR(255) DEFAULT NULL,
        district VARCHAR(255) DEFAULT NULL,
        state VARCHAR(255) DEFAULT NULL,
        notes TEXT,
        status VARCHAR(50) DEFAULT 'Active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `); 
    console.log('Table created'); 
    c.end(); 
  })
  .catch(e => console.error(e.message));
