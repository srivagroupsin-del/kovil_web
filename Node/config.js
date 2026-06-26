module.exports = {
  databaseConfig: {
    wsinventory: {
      host: process.env.DB_HOST || "127.0.0.1",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : "password",
      database: process.env.DB_NAME || "login",
      port: process.env.DB_PORT || 3306,
    },
  },
};
