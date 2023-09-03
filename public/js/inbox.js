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

renderChatList();
