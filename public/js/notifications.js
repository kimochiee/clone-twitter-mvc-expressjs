const getAllNotifications = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://localhost:8001/api/v1/notifications',
    });

    if (res.data.status === 'success') {
      outputNotificationList(
        res.data.notifications,
        document.querySelector('.resultsContainer')
      );
    }
  } catch (error) {
    handleLogout(error);
  }
};

document
  .getElementById('markNotificationAsRead')
  .addEventListener('click', () => markNotificationAsOpened());

const outputNotificationList = (notifications, container) => {
  if (notifications.length != 0) {
    let html = '';

    notifications.forEach((notification) => {
      html += createNotificationHtml(notification);

      container.innerHTML = html;
    });
  } else {
    container.innerHTML = '<span class="noResults">No results</span>';
  }
};

getAllNotifications();
