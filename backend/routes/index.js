const WebSocket = require('ws');
const path = require("path");

const clients = new Set();

const broadcast = (message) => {
  const jsonMessage = JSON.stringify(message);
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(jsonMessage);
    }
  });
};

module.exports = (app, server) => {
  const wss = new WebSocket.Server({ server });

  app.get([
    '/',
    '/login',
    '/register',
    '/items',
    '/createItem',
    '/itemOverview',
    '/itemDetail',
    '/categories',
    '/createCategory',
    '/projects',
    '/projectDetail',
    '/createProject',
    '/scan'
  ], (req, res) => {
    res.sendFile(path.resolve('./build/index.html'))
  });
  require('./item')(app, broadcast);
  require('./itemCategory')(app);
  require('./project')(app, broadcast);
  require('./user')(app);

  wss.on('connection', (socket) => {
    console.log('Client connected');
    clients.add(socket);

    socket.on('close', () => {
      console.log('Client disconnected');
      clients.delete(socket);
    });
  });
};
