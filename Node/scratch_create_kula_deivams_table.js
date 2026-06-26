require("dotenv").config();
const { getConnectionWsinventoryPool } = require("./lib/connection");

const query = `
CREATE TABLE IF NOT EXISTS kula_deivams (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    community_id INT NOT NULL,
    sub_community_id INT NOT NULL,
    kula_id INT NOT NULL,

    deity_name_tamil VARCHAR(255) NOT NULL,
    deity_name_english VARCHAR(255) DEFAULT NULL,

    title VARCHAR(255) DEFAULT NULL,
    info VARCHAR(500) DEFAULT NULL,

    image_path VARCHAR(255) DEFAULT NULL,
    logo_path VARCHAR(255) DEFAULT NULL,
    icon_path VARCHAR(255) DEFAULT NULL,

    description TEXT DEFAULT NULL,
    history TEXT DEFAULT NULL,

    status ENUM('active','inactive') DEFAULT 'active',

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_kuladeivam_community
        FOREIGN KEY (community_id)
        REFERENCES communities(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_kuladeivam_subcommunity
        FOREIGN KEY (sub_community_id)
        REFERENCES sub_communities(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_kuladeivam_kula
        FOREIGN KEY (kula_id)
        REFERENCES kulas(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;
`;

getConnectionWsinventoryPool(async (err, client) => {
  if (err) {
    console.error("Connection error:", err);
    process.exit(1);
  }
  try {
    console.log("Executing query...");
    await client.query(query);
    console.log("kula_deivams table created successfully!");
  } catch (error) {
    console.error("Error creating table:", error);
  } finally {
    client.release();
    process.exit(0);
  }
});
