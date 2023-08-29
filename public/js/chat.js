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

    try {
      const res = await axios({
        method: 'GET',
        url: `http://localhost:8001/api/v1/chats/${chatJS._id}/messages`,
      });

      if (res.data.status === 'success') {
        let messages = [];

        res.data.messages.forEach((message) => {
          const html = createMessageHtml(message);
          messages.push(html);
        });
                          
        const messagesHtml = messages.join('');

        // document.querySelector('.chatMessages').innerHTML = html;
        document
          .querySelector('.chatMessages')
          .insertAdjacentHTML('afterbegin', messagesHtml);
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
    messageSubmited();
  });
}

const inputTextbox = document.querySelector('.inputTextbox');
if (inputTextbox) {
  inputTextbox.addEventListener('keydown', (e) => {
    if (e.which == 13 && !e.shiftKey) {
      messageSubmited();
      e.preventDefault();
    }
  });
}

const messageSubmited = () => {
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
      addChatMessageHtml(res.data.message);
    }
  } catch (error) {
    handleLogout(error);
  }
};

const addChatMessageHtml = (message) => {
  if (!message || !message._id) {
    alert('message is not valid');
    return;
  }

  const html = createMessageHtml(message);

  // document.querySelector('.chatMessages').innerHTML = html;
  document
    .querySelector('.chatMessages')
    .insertAdjacentHTML('afterbegin', html);
};

const createMessageHtml = (message) => {
  const isMine = message.sender._id == userRequestJS._id;
  const liClassName = isMine
    ? 'class="message mine"'
    : 'class="message theirs"';

  return `<li ${liClassName}>
    <div class="messageContainer">
      <span class="messageBody">
        ${message.content}
      </span>
    </div>
  </li>`;
};
