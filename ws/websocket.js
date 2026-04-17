const ws = require('ws');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const Message = require('../models/Message');
const logger = require('../config/logger');

const jwtSecret = process.env.JWT_SECRET;
const UPLOADS_DIR = __dirname + '/../uploads/';

// Ensure uploads dir exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR);
}

const setupWebSocket = (server) => {
  const wss = new ws.WebSocketServer({ server });

  wss.on('connection', (connection, req) => {
    connection.isAuthenticated = false;
    connection.isAlive = true;

    function notifyAboutOnlinePeople() {
      [...wss.clients].forEach(client => {
        client.send(JSON.stringify({
          online: [...wss.clients]
            .filter(c => c.userId && c.username)
            .map(c => ({ userId: c.userId, username: c.username })),
        }));
      });
    }

    // Ping/Pong connection dead drop fix
    const pingInterval = setInterval(() => {
      [...wss.clients].forEach(client => {
        if (!client.isAlive) {
          logger.info(`Terminating dead connection for: ${client.username || 'Anonymous'}`);
          client.terminate();
          notifyAboutOnlinePeople();
          return;
        }

        client.isAlive = false; 
        client.ping();
      });
    }, 10000);

    wss.on('close', () => {
      clearInterval(pingInterval);
    });

    connection.on('pong', () => {
      connection.isAlive = true;
    });

    // Parse cookies safely
    const cookies = req.headers.cookie || '';
    if (cookies) {
      const tokenCookieString = cookies.split(';').find(str => str.trim().startsWith('token='));
      if (tokenCookieString) {
        const token = tokenCookieString.split('=')[1].trim();
        if (token) {
          jwt.verify(token, jwtSecret, {}, (err, userData) => {
            if (err) {
              logger.warn(`Invalid WS token attempt: ${err.message}`);
              return;
            }
            const { userId, username } = userData;
            connection.userId = userId;
            connection.username = username;
            connection.isAuthenticated = true;
            connection.send(JSON.stringify({ type: 'auth_success' }));
            logger.info(`WS Authenticated: ${username}`);
          });
        }
      }
    }

    connection.on('message', async (message) => {
      if (!connection.isAuthenticated) return;

      try {
        const messageData = JSON.parse(message.toString());
        const { recipient, text, file } = messageData;

        // Security: Prevent extremely large payloads (Bombing/OOM attack)
        if (text && text.length > 5000) {
          logger.warn(`Rejected oversized message from ${connection.username}`);
          return;
        }

        if (file && file.data && file.data.length > 10 * 1024 * 1024) { // 10MB limit
          logger.warn(`Rejected oversized file from ${connection.username}`);
          return;
        }

        if (!connection.userId) return;

        let filename = null;
        if (file) {
          const parts = file.name.split('.');
          const ext = parts[parts.length - 1];
          filename = Date.now() + '.' + ext;
          const path = UPLOADS_DIR + filename;

          const bufferData = Buffer.from(file.data.split(',')[1], 'base64');
          fs.writeFile(path, bufferData, (err) => {
            if (err) logger.error(`File write error: ${err.message}`);
          });
        }

        if (recipient && (text || file)) {
          const messageDoc = await Message.create({
            sender: connection.userId,
            recipient,
            text,
            file: file ? filename : null,
          });

          [...wss.clients]
            .filter(c => c.userId === recipient || c.userId === connection.userId)
            .forEach(c => c.send(JSON.stringify({
              text,
              sender: connection.userId,
              recipient,
              file: file ? filename : null,
              _id: messageDoc._id,
            })));
        }
      } catch (error) {
        logger.error(`WS Message Error: ${error.message}`);
      }
    });

    notifyAboutOnlinePeople();
  });
};

module.exports = setupWebSocket;
