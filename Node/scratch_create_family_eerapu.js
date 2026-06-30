require("dotenv").config();
const { getConnectionWsinventoryPool } = require("./lib/connection");

const query = `
CREATE TABLE IF NOT EXISTS family_eerapu (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    family_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    kula_deivam_id BIGINT DEFAULT NULL,
    generation_no VARCHAR(50) DEFAULT NULL,
    status VARCHAR(50) DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_family_eerapu_family
        FOREIGN KEY (family_id)
        REFERENCES families(id)
        ON DELETE CASCADE,
        
    CONSTRAINT fk_family_eerapu_kula_deivam
        FOREIGN KEY (kula_deivam_id)
        REFERENCES kula_deivams(id)
        ON DELETE SET NULL
) ENGINE=InnoDB;
`;

getConnectionWsinventoryPool(async (err, client) => {
  if (err) {
    console.error("Connection error:", err);
    process.exit(1);
  }
  try {
    console.log("Executing query to create family_eerapu table...");
    await client.query(query);
    console.log("family_eerapu table created successfully!");
  } catch (error) {
    console.error("Error creating table:", error);
  } finally {
    client.release();
    process.exit(0);
  }
});
