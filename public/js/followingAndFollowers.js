const renderFollowingAndFollowers = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: `http://localhost:8001/api/v1/users/${userJS}/${selectedTabJS}`,
    });

    if (res.data.status === 'success') {
      if (selectedTabJS == 'following') {
        renderUser(
          res.data.followingList,
          document.querySelector('.resultsContainer')
        );
      } else if (selectedTabJS == 'followers') {
        renderUser(
          res.data.followersList,
          document.querySelector('.resultsContainer')
        );
      }
    }
  } catch (error) {
    handleLogout(error);
  }
};
const renderUser = (datas, container) => {
  if (datas.length > 0) {
    let html = '';

    datas.forEach((data) => {
      let followButton = '';
      const buttonClass = userRequestJS.following.includes(data._id)
        ? 'class= "followButton following"'
        : 'class= "followButton"';
      const buttonText = userRequestJS.following.includes(data._id)
        ? 'Following'
        : 'Follow';

      if (
        userRequestJS.following.includes(data._id) ||
        userRequestJS.followers.includes(data._id)
      ) {
        followButton = `<div class="followButtonContainer">
            <button ${buttonClass} data-user="${data._id}">${buttonText}</button>
        </div>`;
      }

      html += `<div class="user">
            <div class="userImageContainer">
                <img src="${data.photo}">
            </div>
            <div class="userDetailsContainer">
                <div class="header">
                    <a href="/profile/${data.username}">${data.firstname} ${data.lastname}</a>
                    <span class="username">@${data.username}</span>
                </div>
            </div>
            ${followButton}
        </div>`;

      container.innerHTML = html;
    });
  } else {
    container.innerHTML = '<span class="noResults">No results</span>';
  }
};
renderFollowingAndFollowers();
