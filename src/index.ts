import express from 'express';
import http from 'http';
import path from 'path';
import { Server } from 'socket.io';

const app = express();
const httpServer = http.createServer(app);

const socketIO = new Server(httpServer);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

const users = [];
const userColors = [
  '#d42c2c',
  '#6c7a1f',
  '#ff8c00',
  '#3ad42c',
  '#752cd4',
  '#d42cb0',
  '#2c3dd4',
  '#2cc0d4',
  '#1f7a4d',
  '#03471d',
];

socketIO.on('connection', (socket) => {
  const { username } = socket.handshake.query;

  users.push(socket.id);

  socket.broadcast.emit('newUser', username);

  socket.on('message', (data) => {
    const userIndex = users.findIndex((id) => id === socket.id);

    socketIO.emit('showMessage', {
      ...data,
      color: userColors[userIndex],
      id: socket.id,
    });
  });

  socket.on('disconnect', () => {
    users.splice(users.indexOf(socket.id), 1);
    socket.broadcast.emit('userDisconnected', username);
  });
});

app.get('/', (_, res) => {
  res.render('index');
});

httpServer.listen(3000, () => {
  console.log('Server started');
});
