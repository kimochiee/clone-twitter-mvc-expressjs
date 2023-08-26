const renderChatList = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://localhost:8001/api/v1/chats',
    });

    if (res.data.status === 'success') {
      outputChatList(
        res.data.chats,
        document.querySelector('.resultsContainer')
      );
    }
  } catch (error) {
    handleLogout(error);
  }
};

const outputChatList = (chatList, container) => {
  if (chatList.length > 0) {
    let html = '';

    chatList.forEach((chat) => {
      html += createChatHTML(chat);

      container.innerHTML = html;
    });
  } else {
    container.innerHTML = '<span class="noResults">No results</span>';
  }
};

const createChatHTML = (chat) => {
  const chatName = createChatName(chat);
  const image = getChatImageElements(chat);
  const latestMessage = '123456';

  return `<a href="/messages/${chat._id}" class="resultListItem">
    ${image}
    <div class="resultsDetailContainer ellipsis">
        <span class="heading ellipsis">${chatName}</span>
        <span class="subText ellipsis">${latestMessage}</span>
    </div>
  </a>`;
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

renderChatList();
