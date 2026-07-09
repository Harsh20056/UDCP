require('dotenv').config();

const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
const { sequelize } = require('./src/models');
const { setupNotificationSocket } = require('./src/sockets/notificationSocket');
const { setIO } = require('./src/services/notification.service');

const PORT = process.env.PORT || 5000;

// Create HTTP server and attach Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Set up Socket.io handlers
setupNotificationSocket(io);

// Pass io to notification service for live push
setIO(io);

// Test database connection and start server
async function start() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    server.listen(PORT, () => {
      console.log(`🚀 UDCP Backend running on http://localhost:${PORT}`);
      console.log(`📡 Socket.io attached`);
      console.log(`🌐 CORS origin: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
    });
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  }
}

start();