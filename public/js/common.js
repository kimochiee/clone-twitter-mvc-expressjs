var cropper;
var selectedUsers = [];

$(document).ready(() => {
  refreshMessageBadge();
  refreshNotificationBadge();
});

// ---------------------------------------------------------------
const handleLogout = async (err) => {
  if (
    err.response.data.msg === 'your session has expired. please log in' ||
    err.response.data.msg === 'you already logout'
  ) {
    alert(err.response.data.msg);
    location.assign('/login');
  } else if (err.response.data.msg === 'Invalid token') {
    try {
      const res = await axios({
        method: 'GET',
        url: 'http://localhost:8001/api/v1/auth/logout',
      });

      if (res.data.status === 'success') {
        location.assign('/login');
      }
    } catch (error) {
      console.log(error);
    }
  } else {
    console.log(err);
  }
};

// ---------------------------------------------------------------
const timeDifference = (current, previous) => {
  var msPerMinute = 60 * 1000;
  var msPerHour = msPerMinute * 60;
  var msPerDay = msPerHour * 24;
  var msPerMonth = msPerDay * 30;
  var msPerYear = msPerDay * 365;

  var elapsed = current - previous;

  if (elapsed < msPerMinute) {
    if (elapsed / 1000 < 30) return 'Just now';
    return Math.round(elapsed / 1000) + ' seconds ago';
  } else if (elapsed < msPerHour) {
    return Math.round(elapsed / msPerMinute) + ' minutes ago';
  } else if (elapsed < msPerDay) {
    return Math.round(elapsed / msPerHour) + ' hours ago';
  } else if (elapsed < msPerMonth) {
    return Math.round(elapsed / msPerDay) + ' days ago';
  } else if (elapsed < msPerYear) {
    return Math.round(elapsed / msPerMonth) + ' months ago';
  } else {
    return Math.round(elapsed / msPerYear) + ' years ago';
  }
};

// ---------------------------------------------------------------
const getPostIdElement = (e) => {
  const isRoot = e.classList.contains('post');
  const rootElement = isRoot ? e : e.closest('.post');

  if (rootElement == null) {
    return;
  } else {
    const postId = rootElement.getAttribute('data-id');

    if (!postId) {
      return alert('Post id undefined');
    }

    return postId;
  }
};

// ---------------------------------------------------------------
const createHTML = (res) => {
  if (res.data.status === 'success') {
    if (res.data.post.replyTo) {
      const replyToUsername = res.data.post.replyTo.postedBy.username;
      var replyFlag = `<div class="replyFlag">
        Replying to <a href="/profile/${replyToUsername}">@${replyToUsername}</a>
      </div>`;
    }

    if (res.data.post.postedBy._id === res.data.user._id) {
      var deleteButton = `<button data-id="${res.data.post._id}" data-toggle="modal" data-target="#deletePostModal">
        <i class="fas fa-times"></i>
      </button>`;
    }

    const html = `<div class="post" data-id="${res.data.post._id}">
                      <div class="mainContentContainer"> 
                        <div class="userImageContainer">
                          <img src="${res.data.post.postedBy.photo}">
                        </div>
                        <div class="postContentContainer">
                          <div class="header">
                            <a href="/profile/${
                              res.data.post.postedBy.username
                            }" class="displayName">${
      res.data.post.postedBy.firstname
    } ${res.data.post.postedBy.lastname}</a>
                            <span class="username">@${
                              res.data.post.postedBy.username
                            }</span>
                            <span class="date">${timeDifference(
                              new Date(),
                              new Date(res.data.post.createdAt)
                            )}</span>
                            ${deleteButton || ''}
                          </div>
                          ${replyFlag || ''}
                          <div class="postBody">
                            <span>${res.data.post.content}</span>
                          </div>
                          <div class="postFooter">
                            <div class="postButtonContainer">
                              <button data-toggle="modal" data-target="#replyModal">
                                <i class='far fa-comment'></i>
                              </button>
                            </div>
                            <div class="postButtonContainer green">
                              <button class="retweetButton">
                                <i class='fas fa-retweet'></i>
                                <span>${
                                  res.data.post.retweetUsers.length || ''
                                }</span>
                              </button>
                            </div>
                            <div class="postButtonContainer red">
                              <button class="likeButton">
                                <i class='far fa-heart'></i>
                                <span>${res.data.post.likes.length || ''}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>`;

    return html;
  }
};

// ----------------------------post textarea-------------------------
const postTextarea = document.getElementById('postTextarea');
if (postTextarea) {
  postTextarea.addEventListener('keyup', () => {
    if (postTextarea.value.trim().length > 0) {
      document.getElementById('submitPostButton').disabled = false;
    } else {
      document.getElementById('submitPostButton').disabled = true;
    }
  });
}

if (document.getElementById('submitPostButton')) {
  document
    .getElementById('submitPostButton')
    .addEventListener('click', async () => {
      try {
        const res = await axios({
          method: 'POST',
          url: 'http://localhost:8001/api/v1/posts',
          data: { content: document.getElementById('postTextarea').value },
        });

        const html = createHTML(res);

        document.querySelector('.postContainer').innerHTML =
          html + document.querySelector('.postContainer').innerHTML;
        document.getElementById('postTextarea').value = '';
        document.getElementById('submitPostButton').disabled = true;
      } catch (error) {
        handleLogout(error);
      }
    });
}

// ----------------------------reply area----------------------------
const replyTextarea = document.getElementById('replyTextarea');
if (replyTextarea) {
  replyTextarea.addEventListener('keyup', () => {
    if (replyTextarea.value.trim().length > 0) {
      document.getElementById('submitReplyButton').disabled = false;
    } else {
      document.getElementById('submitReplyButton').disabled = true;
    }
  });
}

$('#replyModal').on('show.bs.modal', async (e) => {
  const button = $(e.relatedTarget)[0];
  const postId = getPostIdElement(button);
  $('#submitReplyButton').attr('data-id', postId);

  try {
    const res = await axios({
      method: 'GET',
      url: `http://localhost:8001/api/v1/posts/${postId}`,
    });

    const html = createHTML(res);

    document.getElementById('originalPostContainer').innerHTML =
      html + document.getElementById('originalPostContainer').innerHTML;
  } catch (error) {
    handleLogout(error);
  }
});

$('#replyModal').on('hidden.bs.modal', () => {
  document.getElementById('originalPostContainer').innerHTML = '';
  $('#submitReplyButton').removeAttr('data-id');
});

const submitReplyButton = document.getElementById('submitReplyButton');
if (submitReplyButton) {
  submitReplyButton.addEventListener('click', async () => {
    const postId = document
      .getElementById('submitReplyButton')
      .getAttribute('data-id');

    try {
      const res = await axios({
        method: 'POST',
        url: `http://localhost:8001/api/v1/posts`,
        data: {
          content: document.getElementById('replyTextarea').value,
          replyTo: postId,
        },
      });

      if (res.data.status === 'success') {
        const html = createHTML(res);

        document.querySelector('.postContainer').innerHTML =
          html + document.querySelector('.postContainer').innerHTML;

        emitNotification(res.data.post.replyTo.postedBy._id);
        location.reload();
      }
    } catch (error) {
      handleLogout(error);
    }
  });
}

// ----------------------------like-----------------------------------
document.addEventListener('click', async (e) => {
  const target = e.target;
  let postId, button;

  if (target.classList.contains('likeButton')) {
    button = target;
    postId = getPostIdElement(target);
  }

  if (postId) {
    try {
      const res = await axios({
        method: 'PATCH',
        url: `http://localhost:8001/api/v1/posts/${postId}/like`,
      });

      if (res.data.status === 'success') {
        const countLikes = res.data.post.likes.length;
        button.querySelector('span').innerText =
          countLikes == 0 ? '' : countLikes;

        if (res.data.post.likes.includes(res.data.user._id)) {
          button.classList.add('active');

          emitNotification(res.data.post.postedBy._id);
        } else {
          button.classList.remove('active');
        }
      }
    } catch (error) {
      handleLogout(error);
    }
  }
});

// ----------------------------retweet--------------------------------
document.addEventListener('click', async (e) => {
  const target = e.target;
  let postId, button;

  if (target.classList.contains('retweetButton')) {
    button = target;
    postId = getPostIdElement(target);
  }

  if (postId) {
    try {
      const res = await axios({
        method: 'POST',
        url: `http://localhost:8001/api/v1/posts/${postId}/retweet`,
      });

      if (res.data.status === 'success') {
        const countRetweets = res.data.post.retweetUsers.length;
        button.querySelector('span').innerText =
          countRetweets == 0 ? '' : countRetweets;

        if (res.data.post.retweetUsers.includes(res.data.user._id)) {
          button.classList.add('active');
          emitNotification(res.data.post.postedBy._id);
        } else {
          button.classList.remove('active');
        }
      }
    } catch (error) {
      handleLogout(error);
    }
  }
});

// ----------------------------delete--------------------------------
$('#deletePostModal').on('show.bs.modal', (e) => {
  const button = $(e.relatedTarget)[0];
  const postId = getPostIdElement(button);
  $('#deletePostButton').attr('data-id', postId);
});

$('#deletePostModal').on('hidden.bs.modal', () => {
  $('#deletePostButton').removeAttr('data-id');
});

const deletePostButton = document.getElementById('deletePostButton');
if (deletePostButton) {
  deletePostButton.addEventListener('click', async () => {
    const postId = deletePostButton.getAttribute('data-id');

    try {
      const res = await axios({
        method: 'DELETE',
        url: `http://localhost:8001/api/v1/posts/${postId}`,
      });

      if (res.data.status === 'success') {
        location.reload();
      }
    } catch (error) {
      handleLogout(error);
    }
  });
}

// ----------------------------assign post--------------------------------
document.addEventListener('click', async (e) => {
  const target = e.target;
  const postId = getPostIdElement(target);

  if (postId && target.tagName.toLowerCase() !== 'button') {
    location.assign('/posts/' + postId);
  }
});

// ----------------------------following followers------------------------
document.addEventListener('click', async (e) => {
  const target = e.target;
  let userId;

  if (target.classList.contains('followButton')) {
    userId = target.getAttribute('data-user');
  }

  if (userId) {
    try {
      const res = await axios({
        method: 'PATCH',
        url: `http://localhost:8001/api/v1/users/${userId}/follow`,
      });

      if (res.data.status === 'success') {
        if (
          res.data.requestUser.following &&
          res.data.requestUser.following.includes(userId)
        ) {
          target.classList.add('following');
          target.innerText = 'Following';
          emitNotification(userId);

          const followersText = document.getElementById('followersValue');
          if (followersText) {
            const value = followersText.innerText;
            followersText.innerText = parseInt(value) + 1;
          }
        } else {
          target.classList.remove('following');
          target.innerText = 'Follow';

          const followersText = document.getElementById('followersValue');
          if (followersText) {
            const value = followersText.innerText;
            followersText.innerText = parseInt(value) - 1;
          }
        }
      }
    } catch (error) {
      handleLogout(error);
    }
  }
});

// ----------------------------upload image------------------------
$('#filePhoto').change(function () {
  if (this.files || this.files[0]) {
    const render = new FileReader();
    render.onload = (e) => {
      const image = document.getElementById('imagePreview');
      image.src = e.target.result;

      if (cropper !== undefined) {
        cropper.destroy();
      }

      cropper = new Cropper(image, {
        aspectRatio: 1 / 1,
        background: false,
      });
    };
    render.readAsDataURL(this.files[0]);
  }
});

const imageUploadButton = document.getElementById('imageUploadButton');
if (imageUploadButton) {
  imageUploadButton.addEventListener('click', () => {
    const canvas = cropper.getCroppedCanvas();

    if (canvas == null) {
      alert('Could not upload image, make sure it is an image file');
      return;
    }

    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append('croppedImage', blob);

      try {
        const res = await axios({
          method: 'POST',
          url: `http://localhost:8001/api/v1/users/profilePicture`,
          headers: {
            processData: false,
            'Content-Type': 'multipart/form-data',
          },
          data: formData,
        });

        if (res.data.status === 'success') {
          location.reload();
        }
      } catch (error) {
        handleLogout(error);
      }
    });
  });
}

// ----------------------------upload cover photo------------------------
$('#coverPhoto').change(function () {
  if (this.files || this.files[0]) {
    const render = new FileReader();
    render.onload = (e) => {
      const image = document.getElementById('coverPreview');
      image.src = e.target.result;

      if (cropper !== undefined) {
        cropper.destroy();
      }

      cropper = new Cropper(image, {
        aspectRatio: 16 / 9,
        background: false,
      });
    };
    render.readAsDataURL(this.files[0]);
  }
});

const coverPhotoButton = document.getElementById('coverPhotoButton');
if (coverPhotoButton) {
  coverPhotoButton.addEventListener('click', () => {
    const canvas = cropper.getCroppedCanvas();

    if (canvas == null) {
      alert('Could not upload image, make sure it is an image file');
      return;
    }

    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append('croppedImage', blob);

      try {
        const res = await axios({
          method: 'POST',
          url: `http://localhost:8001/api/v1/users/coverPhoto`,
          headers: {
            processData: false,
            'Content-Type': 'multipart/form-data',
          },
          data: formData,
        });

        if (res.data.status === 'success') {
          location.reload();
        }
      } catch (error) {
        handleLogout(error);
      }
    });
  });
}

// ----------------------------pin post--------------------------------
$('#confirmPinModal').on('show.bs.modal', (e) => {
  const button = $(e.relatedTarget)[0];
  const postId = getPostIdElement(button);
  $('#pinPostButton').attr('data-id', postId);
});

$('#confirmPinModal').on('hidden.bs.modal', () => {
  $('#pinPostButton').removeAttr('data-id');
});

const pinPostButton = document.getElementById('pinPostButton');
if (pinPostButton) {
  pinPostButton.addEventListener('click', async () => {
    const postId = pinPostButton.getAttribute('data-id');

    try {
      const res = await axios({
        method: 'PATCH',
        url: `http://localhost:8001/api/v1/posts/${postId}/pinPost`,
      });

      if (res.data.status === 'success') {
        location.reload();
      }
    } catch (error) {
      handleLogout(error);
    }
  });
}

// ----------------------------find user for chat--------------------------------
let timerMessage;

const userSearchTextBox = document.getElementById('userSearchTextBox');
if (userSearchTextBox) {
  userSearchTextBox.addEventListener('keydown', (e) => {
    clearTimeout(timerMessage);

    let value = userSearchTextBox.value;

    if (value == '' && e.keyCode == 8) {
      selectedUsers.pop();
      updateSelectedUsersHTML();
      document.querySelector('.resultsContainer').innerHTML = '';

      if (selectedUsers.length == 0) {
        document.getElementById('createChatButton').disabled = true;
      }

      return;
    }

    timerMessage = setTimeout(() => {
      value = userSearchTextBox.value.trim();

      if (value == '') {
        document.querySelector('.resultsContainer').innerHTML = '';
      } else {
        searchUserForMessage(value);
      }
    }, 1000);
  });
}

const searchUserForMessage = async (value) => {
  try {
    const res = await axios({
      method: 'GET',
      url: `http://localhost:8001/api/v1/users?name=${value}`,
    });

    if (res.data.status === 'success') {
      renderUsersForMessageSearch(
        res,
        document.querySelector('.resultsContainer')
      );
    }
  } catch (error) {
    handleLogout(error);
  }
};

const renderUsersForMessageSearch = (res, container) => {
  if (res.data.users.length > 0) {
    const users = res.data.users;
    let html = '';

    users.forEach((user) => {
      if (
        user._id == res.data.userRequest._id ||
        selectedUsers.some((u) => u.username == user.username)
      ) {
        return;
      }

      html += `<div class="user" onclick="userSelected('${user.username}','${user.firstname}','${user.lastname}', '${user._id}')">
            <div class="userImageContainer">
                <img src="${user.photo}">
            </div>
            <div class="userDetailsContainer">
                <div class="header">
                    <a href="/profile/${user.username}">${user.firstname} ${user.lastname}</a>
                    <span class="username">@${user.username}</span>
                </div>
            </div>
        </div>`;

      container.innerHTML = html;
    });
  } else {
    container.innerHTML = '<span class="noResults">No results</span>';
  }
};

const userSelected = (username, firstname, lastname, _id) => {
  selectedUsers.push({ username, firstname, lastname, _id });
  updateSelectedUsersHTML();

  document.getElementById('userSearchTextBox').value = '';
  document.getElementById('userSearchTextBox').focus();
  document.querySelector('.resultsContainer').innerHTML = '';
  document.getElementById('createChatButton').disabled = false;
};

const updateSelectedUsersHTML = () => {
  let elements = [];

  selectedUsers.forEach((user) => {
    const name = user.firstname + ' ' + user.lastname;
    const userElement = `<span class="selectedUser">${name}</span>`;
    elements.push(userElement);
  });

  const selectedUserArray = document.querySelectorAll('.selectedUser');
  if (selectedUserArray) {
    selectedUserArray.forEach((user) => user.remove());
  }

  document
    .getElementById('selectedUser')
    .insertAdjacentHTML('beforebegin', elements);
};

// ----------------------------chat-message--------------------------------
const createChatButton = document.getElementById('createChatButton');
if (createChatButton) {
  createChatButton.addEventListener('click', async () => {
    try {
      const res = await axios({
        method: 'POST',
        url: 'http://localhost:8001/api/v1/chats',
        data: { users: selectedUsers },
      });

      if (res.data.status === 'success') {
        window.location.href = `/messages/${res.data.chat._id}`;
      }
    } catch (error) {
      handleLogout(error);
    }
  });
}

const createChatName = (chat) => {
  let chatName = chat.chatName;

  if (!chatName) {
    const otherChatUsers = getOtherChatUsers(chat.users);
    const namesArray = otherChatUsers.map(
      (user) => user.firstname + ' ' + user.lastname
    );
    chatName = namesArray.join(', ');
  }

  return chatName;
};

const getOtherChatUsers = (users) => {
  if (users.length == 1) {
    return users;
  }

  return users.filter((user) => user._id != userLoggedInJS._id);
};

const messageReceived = (newMessage) => {
  if (!document.querySelector(`[data-room="${newMessage.chat.id}"]`)) {
    showMessagePopup(newMessage);
  } else {
    addChatMessageHtml(newMessage);
  }

  refreshMessageBadge();
};

const showMessagePopup = (data) => {
  if (!data.chat.latestMessage._id) {
    data.chat.latestMessage = data;
  }

  const html = createChatHTML(data.chat);
  const element = document.createElement('div');
  element.innerHTML = html;
  document.querySelector('#notificationList').prepend(element);

  setTimeout(() => {
    fadeOutElement(element);
  }, 3000);
};

const createChatHTML = (chat) => {
  const chatName = createChatName(chat);
  const image = getChatImageElements(chat);
  const latestMessage = getLatestMessage(chat.latestMessage);
  const activeClass =
    !chat.latestMessage ||
    chat.latestMessage.readBy.includes(userLoggedInJS._id)
      ? ''
      : 'active';

  return `<a href="/messages/${chat._id}" class="resultListItem ${activeClass}">
    ${image}
    <div class="resultsDetailContainer ellipsis">
        <span class="heading ellipsis">${chatName}</span>
        <span class="subText ellipsis">${latestMessage}</span>
    </div>
  </a>`;
};

const getLatestMessage = (latestMessage) => {
  if (latestMessage != null) {
    const sender = latestMessage.sender;
    return `${sender.firstname} ${sender.lastname}: ${latestMessage.content}`;
  }

  return 'New chat';
};

const getChatImageElements = (chat) => {
  const otherChatUsers = getOtherChatUsers(chat.users);
  let chatImage = getUserChatImageElement(otherChatUsers[0]);
  let groupChatClass = '';

  if (otherChatUsers.length > 1) {
    groupChatClass = 'groupChatImage';
    chatImage += getUserChatImageElement(otherChatUsers[1]);
  }

  return `<div class="resultsImageContainer ${groupChatClass}">
    ${chatImage}
  </div>`;
};

const getUserChatImageElement = (user) => {
  return `<img src="${user.photo}" alt="user photo">`;
};

// ----------------------------notification--------------------------------
document.addEventListener('click', async (e) => {
  const target = e.target;
  let notificationId, href;

  if (
    target.classList.contains('resultListItem') &&
    target.classList.contains('active')
  ) {
    notificationId = target.getAttribute('data-notification');
    href = target.getAttribute('href');
    e.preventDefault();

    const callback = () => (window.location = href);
    markNotificationAsOpened(notificationId, callback);
  }
});

const markNotificationAsOpened = async (
  notificationId = null,
  callback = null
) => {
  if (callback == null) {
    callback = () => {
      return location.reload();
    };
  }

  const url =
    notificationId != null
      ? `http://localhost:8001/api/v1/notifications/${notificationId}/markAsOpened`
      : 'http://localhost:8001/api/v1/notifications/markAsOpened';

  try {
    const res = await axios({
      method: 'PATCH',
      url,
    });

    if (res.data.status === 'success') {
      callback();
    }
  } catch (error) {
    handleLogout(error);
  }
};

// ----------------------------badge--------------------------------
const refreshMessageBadge = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://localhost:8001/api/v1/chats?unreadOnly=true',
    });

    if (res.data.status === 'success') {
      const numResults = res.data.chats.length;

      if (numResults > 0) {
        document.getElementById('messageBadge').innerText = numResults;
        document.getElementById('messageBadge').classList.add('active');
      } else {
        document.getElementById('messageBadge').innerText = '';
        document.getElementById('messageBadge').classList.remove('active');
      }
    }
  } catch (error) {
    handleLogout(error);
  }
};

const refreshNotificationBadge = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://localhost:8001/api/v1/notifications?unreadOnly=true',
    });

    if (res.data.status === 'success') {
      const numResults = res.data.notifications.length;

      if (numResults > 0) {
        document.getElementById('notificationBadge').innerText = numResults;
        document.getElementById('notificationBadge').classList.add('active');
      } else {
        document.getElementById('notificationBadge').innerText = '';
        document.getElementById('notificationBadge').classList.remove('active');
      }
    }
  } catch (error) {
    handleLogout(error);
  }
};

// ----------------------------notification popup--------------------------------
const showNotificationPopup = (data) => {
  const html = createNotificationHtml(data);
  const element = document.createElement('div');
  element.innerHTML = html;
  document.querySelector('#notificationList').prepend(element);

  setTimeout(() => {
    fadeOutElement(element);
  }, 3000);
};

const fadeOutElement = (element) => {
  let opacity = 1;
  const timer = setInterval(() => {
    if (opacity <= 0.1) {
      clearInterval(timer);
      element.style.display = 'none';
    }
    element.style.opacity = opacity;
    opacity -= opacity * 0.1;
  }, 40);
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
