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
});
