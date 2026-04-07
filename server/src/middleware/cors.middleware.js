import cors from 'cors';

const parseBoolean = (value, defaultValue) => {
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === 'true';
};

const parseOrigins = (value, fallback = []) => {
  if (!value) return fallback;
  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const allowedOrigins = parseOrigins(process.env.CORS_ALLOWED_ORIGINS, [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:3000'
]);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin && parseBoolean(process.env.CORS_ALLOW_NO_ORIGIN, true)) {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: parseBoolean(process.env.CORS_CREDENTIALS, true),
  optionsSuccessStatus: Number(process.env.CORS_OPTIONS_SUCCESS_STATUS || 200)
};

export default cors(corsOptions);
