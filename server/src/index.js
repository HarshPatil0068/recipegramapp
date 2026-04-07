import './config/env.js';

import dbConnection from "./config/dbConnection.js";
dbConnection();

import app from "./app.js";
import { createServer } from 'http';
import { initializeSocket } from './util/socket.js';
import logger from './util/logger.js';

// Create HTTP server for socket.io
const httpServer = createServer(app);

// Initialize socket.io — throws immediately if JWT_SECRET is missing
const io = initializeSocket(httpServer);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});

httpServer.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    logger.error(`Port ${PORT} is already in use`);
    process.exit(1);
  }
  throw err;
});

// Export io for use in other modules if needed
export default io;
