require('dotenv').config();

const sharedConfig = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  dialect: 'postgres',
  logging: process.env.DB_LOGGING === 'true'
};

module.exports = {
  development: sharedConfig,
  test: sharedConfig,
  production: sharedConfig
};
