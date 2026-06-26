require("dotenv").config();
const { getConnectionWsinventoryPool } = require("./lib/connection");

const dropQuery = "DROP TABLE IF EXISTS family_details;";

const createQuery = `
CREATE TABLE IF NOT EXISTS community_selections (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    community_id BIGINT NOT NULL,
    sub_community_id BIGINT NOT NULL,
    kula_id BIGINT NOT NULL,
    kula_deivam_id BIGINT NOT NULL,

    vagaiyara_id BIGINT NOT NULL,
    tharpothaiya_vagaiyara VARCHAR(255) DEFAULT NULL,

    generation_no INT DEFAULT NULL,

    marital_status ENUM('married','unmarried') DEFAULT 'unmarried',

    spouse_name VARCHAR(255) DEFAULT NULL,

    spouse_kula_deivam_id BIGINT DEFAULT NULL,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_cs_community
        FOREIGN KEY (community_id)
        REFERENCES communities(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_cs_subcommunity
        FOREIGN KEY (sub_community_id)
        REFERENCES sub_communities(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_cs_kula
        FOREIGN KEY (kula_id)
        REFERENCES kulas(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_cs_kuladeivam
        FOREIGN KEY (kula_deivam_id)
        REFERENCES kula_deivams(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_cs_vagaiyara
        FOREIGN KEY (vagaiyara_id)
        REFERENCES vagaiyaras(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_cs_spouse_kuladeivam
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
    console.log("Dropping old family_details table...");
    await client.query(dropQuery);
    console.log("family_details table dropped.");

    console.log("Creating community_selections table...");
    await client.query(createQuery);
    console.log("community_selections table created successfully!");
  } catch (error) {
    console.error("Error running database query:", error);
  } finally {
    client.release();
    process.exit(0);
  }
});
