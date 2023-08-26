const renderChatName = async () => {
  const chatName = document.getElementById('chatName');
  if (chatName) {
    try {
      const res = await axios({
        method: 'GET',
        url: 'http://localhost:8001/api/v1/chats/' + chatJS._id,
      });

      if (res.data.status === 'success') {
        chatName.innerText = createChatName(res.data.chat);
      }
    } catch (error) {
      handleLogout(error);
    }
  }
};
renderChatName();

const chatNameButton = document.getElementById('chatNameButton');
if (chatNameButton) {
  chatNameButton.addEventListener('click', async () => {
    const name = document.getElementById('chatNameTextbox').value.trim();

    const res = await axios({
      method: 'PATCH',
      url: 'http://localhost:8001/api/v1/chats/' + chatJS._id,
      data: { chatName: name },
    });

    if (res.data.status === 'success') {
      location.reload();
    }
  });
}

const sendMessageButton = document.querySelector('.sendMessageButton');
if (sendMessageButton) {
  sendMessageButton.addEventListener('click', () => {
    messageSubmitred();
  });
}

const inputTextbox = document.querySelector('.inputTextbox');
if (inputTextbox) {
  inputTextbox.addEventListener('keydown', (e) => {
    if (e.which == 13 && !e.shiftKey) {
      messageSubmitred();
      e.preventDefault();
    }
  });
}

const messageSubmitred = () => {
  const content = inputTextbox.value.trim();
  if (content != '') {
    sendMessage(content);
    inputTextbox.value = '';
  }
};

const sendMessage = async (content) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://localhost:8001/api/v1/messages',
      data: { content, chatId: chatJS._id },
    });

    if (res.data.status === 'success') {
      console.log(res.data.message);
    }
  } catch (error) {
    handleLogout(error);
  }
};
