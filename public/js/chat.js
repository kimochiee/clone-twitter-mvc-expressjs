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

