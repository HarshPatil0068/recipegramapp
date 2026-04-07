import dotenv from 'dotenv';
dotenv.config();

/**
 * Centralized environment configuration.
 * Provides defaults for development and validates required variables.
 */
const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/recipegram',
  JWT_SECRET: process.env.JWT_SECRET,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
};

// Validate required environment variables
const required = ['JWT_SECRET'];
const missing = required.filter((key) => !env[key]);
if (missing.length > 0) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

export default env;
