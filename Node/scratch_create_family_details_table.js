require("dotenv").config();
const { getConnectionWsinventoryPool } = require("./lib/connection");

const query = `
CREATE TABLE IF NOT EXISTS family_details (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    vagaiyara_id BIGINT NOT NULL,

    marital_status ENUM(
        'married',
        'unmarried'
    ) NOT NULL,

    spouse_name VARCHAR(255) DEFAULT NULL,

    spouse_kula_deivam_id BIGINT DEFAULT NULL,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_family_details_vagaiyara
        FOREIGN KEY (vagaiyara_id)
        REFERENCES vagaiyaras(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_family_details_spouse_kuladeivam
        FOREIGN KEY (spouse_kula_deivam_id)
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
    console.log("Executing query to create family_details table...");
    await client.query(query);
    console.log("family_details table created successfully!");
  } catch (error) {
    console.error("Error creating table:", error);
  } finally {
    client.release();
    process.exit(0);
  }
});
