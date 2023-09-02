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

const createNotificationHtml = (notification) => {
  const userFrom = notification.userFrom;
  const text = getNotificationText(notification);
  const url = getNotificationURL(notification);
  const className = notification.opened ? '' : 'active';

  return `<a href="${url}" class="resultListItem notification ${className}" data-notification="${notification._id}">
    <div class="resultsImageContainer">
      <img src="${userFrom.photo}">
    </div>
    <div class="resultsDetailsContainer ellipsis">
      ${text}
    </div>
  </a>`;
};

const getNotificationText = (notification) => {
  const userFrom = notification.userFrom;
  const userFromName = `${userFrom.firstname} ${userFrom.lastname}`;
  let text = '';

  if (notification.notificationType == 'retweet') {
    text = `<strong>${userFromName}</strong> retweeted one of your posts`;
  } else if (notification.notificationType == 'postLike') {
    text = `<strong>${userFromName}</strong> liked one of your posts`;
  } else if (notification.notificationType == 'reply') {
    text = `<strong>${userFromName}</strong> replied one of your posts`;
  } else if (notification.notificationType == 'follow') {
    text = `<strong>${userFromName}</strong> followed you`;
  }

  return `<span class="ellipsis">${text}</span>`;
};

const getNotificationURL = (notification) => {
  let url = '#';

  if (
    notification.notificationType == 'retweet' ||
    notification.notificationType == 'postLike' ||
    notification.notificationType == 'reply'
  ) {
    url = `/posts/${notification.entityId}`;
  } else if (notification.notificationType == 'follow') {
    url = `/profile/${notification.entityId}`;
  }

  return url;
};

getAllNotifications();
