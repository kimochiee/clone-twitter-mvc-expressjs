var connected = false;
const socket = io('http://localhost:8001');

socket.emit('setup', userLoggedInJS);
socket.on('connected', () => {
  connected = true;
});
