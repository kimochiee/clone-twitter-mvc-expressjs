var connected = false;
const socket = io('http://localhost:8001');

socket.emit('setup', userLoggedInJS);
socket.on('connected', () => (connected = true));
socket.on('message received', (newMessage) => messageReceived(newMessage));

socket.on('notification received', () => {
  fetch('http://localhost:8001/api/v1/notifications/latest')
    .then((response) => response.json())
    .then((data) => {
      showNotificationPopup(data.notification);
      refreshNotificationBadge();
    })
    .catch((error) => {
      console.error(error);
    });
});

const emitNotification = (userId) => {
  if (userId == userLoggedInJS._id) {
    return;
  }

  socket.emit('notification received', userId);
};
