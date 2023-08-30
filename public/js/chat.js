var typing = false;
var lastTypingTime;

const renderChatName = async () => {
  const chatName = document.getElementById('chatName');
  if (chatName) {
    socket.emit('join room', chatJS._id);
    socket.on('typing', () => {
      document.querySelector('.typingDots').style.display = 'block';
    });
    socket.on('stop typing', () => {
      document.querySelector('.typingDots').style.display = 'none';
    });

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
        const data = res.data.messages;
        let messages = [];
        let lastSenderId = '';

        data.forEach((message, index) => {
          const html = createMessageHtml(
            message,
            data[index + 1] ? data[index + 1] : null,
            lastSenderId
          );
          messages.push(html);
          lastSenderId = message.sender._id;
        });

        const messagesHtml = messages.join('');

        document
          .querySelector('.chatMessages')
          .insertAdjacentHTML('afterbegin', messagesHtml);
        scrollToBottom(false);
        document.querySelector('.loadingSpinnerContainer').remove();
        document.querySelector('.chatContainer').style.visibility = 'visible';
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
    updateTyping();

    if (e.which == 13 && !e.shiftKey) {
      messageSubmited();
      e.preventDefault();
    }
  });
}

const updateTyping = () => {
  if (!connected) {
    console.log('not connected');
    return;
  }

  if (!typing) {
    typing = true;
    socket.emit('typing', chatJS._id);
  }

  lastTypingTime = new Date().getTime();
  var timerLength = 3000;

  setTimeout(() => {
    var timeNow = new Date().getTime();
    var timeDiff = timeNow - lastTypingTime;

    if (timeDiff >= timerLength && typing) {
      socket.emit('stop typing', chatJS._id);
      typing = false;
    }
  }, timerLength);
};

const messageSubmited = () => {
  const content = inputTextbox.value.trim();
  if (content != '') {
    sendMessage(content);
    inputTextbox.value = '';
    socket.emit('stop typing', chatJS._id);
    typing = false;
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

      if (connected) {
        socket.emit('new message', res.data.message);
      }
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

  const html = createMessageHtml(message, null, '');

  document.querySelector('.chatMessages').insertAdjacentHTML('beforeend', html);
  scrollToBottom(true);
};

const createMessageHtml = (message, nextMessage, lastSenderId) => {
  const sender = message.sender;
  const senderName = sender.firstname + ' ' + sender.lastname;
  const currentSenderId = sender._id;
  const nextSenderId = nextMessage != null ? nextMessage.sender._id : '';
  const isFirst = lastSenderId != currentSenderId;
  const isLast = nextSenderId != currentSenderId;
  const isMine = sender._id == userRequestJS._id;

  let liClassName = isMine ? 'class="message mine"' : 'class="message theirs"';
  let nameElement = '';
  let imageContainer = ``;
  let profileImage = ``;

  if (isFirst && isMine) {
    liClassName = 'class="message mine first"';
  }

  if (isLast && isMine) {
    liClassName = 'class="message mine last"';
    profileImage = `<img src="${sender.photo}" />`;
  }

  if (isFirst && !isMine) {
    liClassName = 'class="message theirs first"';
    nameElement = `<span class="senderName">${senderName}</span>`;
  }

  if (isLast && !isMine) {
    liClassName = 'class="message theirs last"';
    profileImage = `<img src="${sender.photo}" />`;
  }

  if (!isMine) {
    imageContainer = `<div class="imageContainer">
      ${profileImage}
    </div>`;
  }

  return `<li ${liClassName}>
    ${imageContainer}
    <div class="messageContainer">
      ${nameElement}
      <span class="messageBody">
        ${message.content}
      </span>
    </div>
  </li>`;
};

const scrollToBottom = (animated) => {
  const container = document.querySelector('.chatMessages');
  const scrollHeight = container.scrollHeight;

  if (animated) {
    container.scrollTo({
      top: scrollHeight,
      behavior: 'smooth',
    });
  } else {
    container.scrollTop = scrollHeight;
  }
};
