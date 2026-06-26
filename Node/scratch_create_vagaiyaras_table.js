require("dotenv").config();
const { getConnectionWsinventoryPool } = require("./lib/connection");

const query = `
CREATE TABLE IF NOT EXISTS vagaiyaras (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    community_id BIGINT NOT NULL,
    sub_community_id BIGINT NOT NULL,
    kula_id BIGINT NOT NULL,

    vagaiyara_name_tamil VARCHAR(255) NOT NULL,
    vagaiyara_name_english VARCHAR(255),

    native_place VARCHAR(255),
    current_place VARCHAR(255),

    title VARCHAR(255),
    info VARCHAR(500),

    image_path VARCHAR(255),
    logo_path VARCHAR(255),
    icon_path VARCHAR(255),

    description TEXT,
    history TEXT,

    status ENUM('active','inactive') DEFAULT 'active',

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (community_id)
        REFERENCES communities(id)
        ON DELETE CASCADE,

    FOREIGN KEY (sub_community_id)
        REFERENCES sub_communities(id)
        ON DELETE CASCADE,

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
    console.log("Executing query to create vagaiyaras table...");
    await client.query(query);
    console.log("vagaiyaras table created successfully!");
  } catch (error) {
    console.error("Error creating table:", error);
  } finally {
    client.release();
    process.exit(0);
  }
});
