const app = require('./app');
const connectDB = require('./config/connectDB');
const port = process.env.SERVER_PORT || 8001;

const server = app.listen(port, async () => {
  try {
    await connectDB(process.env.MONGO_DB);
    console.log(`Server is running on port ${port}`);
  } catch (error) {
    console.log(error);
  }
});

const io = require('socket.io')(server, { pingTimeout: 60000 });
io.on('connection', (socket) => {
  socket.on('setup', (userData) => {
    socket.join(userData._id);
    socket.emit('connected');
  });

  socket.on('join room', (room) => socket.join(room));
  socket.on('typing', (room) => socket.in(room).emit('typing'));
  socket.on('stop typing', (room) => socket.in(room).emit('stop typing'));
  socket.on('notification received', (room) =>
    socket.in(room).emit('notification received')
  );

  socket.on('new message', (newMessage) => {
    const chat = newMessage.chat;

    if (!chat.users) {
      return console.log('chat.users is not defined');
    }

    chat.users.forEach((user) => {
      if (user._id == newMessage.sender._id) return;
      socket.in(user._id).emit('message received', newMessage);
    });
  });
});
