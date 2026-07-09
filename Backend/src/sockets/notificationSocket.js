const { verifyToken } = require('../utils/tokenUtils');

/**
 * Set up Socket.io connection handling.
 * On connect, authenticates via JWT and joins a room by user.id.
 */
function setupNotificationSocket(io) {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));

    try {
      const decoded = verifyToken(token);
      socket.userId = decoded.userId;
      socket.userRole = decoded.role;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket] User ${socket.userId} connected`);

    // Join personal room for targeted notifications
    socket.join(socket.userId);

    // Join role-based room
    if (socket.userRole) {
      socket.join(`role:${socket.userRole}`);
    }

    socket.on('disconnect', () => {
      console.log(`[Socket] User ${socket.userId} disconnected`);
    });
  });
}

module.exports = { setupNotificationSocket };
