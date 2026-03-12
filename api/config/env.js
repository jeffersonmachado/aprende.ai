import dotenv from 'dotenv';

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3015),
  jwtSecret: process.env.JWT_SECRET || 'aprende_ai_dev_secret',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5174',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    name: process.env.DB_NAME || 'aprende_ai',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    logging: process.env.DB_LOGGING === 'true'
  }
};
