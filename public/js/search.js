let timer;

const searchBox = document.getElementById('searchBox');
if (searchBox) {
  searchBox.addEventListener('keydown', () => {
    clearTimeout(timer);

    let value = searchBox.value;
    const searchType = searchBox.getAttribute('data-search');

    timer = setTimeout(() => {
      value = searchBox.value.trim();

      if (value == '') {
        document.querySelector('.resultsContainer').innerHTML = '';
      } else {
        search(value, searchType);
      }
    }, 1000);
  });
}

const search = async (value, searchType) => {
  const url =
    searchType == 'users'
      ? `http://localhost:8001/api/v1/users?name=${value}`
      : `http://localhost:8001/api/v1/posts?content=${value}`;

  try {
    const res = await axios({
      method: 'GET',
      url,
    });

    if (res.data.status === 'success') {
      if (searchType == 'users') {
        renderSearchUser(res, document.querySelector('.resultsContainer'));
      } else {
        renderSearchPost(res, document.querySelector('.resultsContainer'));
      }
    }
  } catch (error) {
    handleLogout(error);
  }
};

const renderSearchPost = (res, container) => {
  if (res.data.posts.length > 0) {
    const posts = res.data.posts;
    let html = '';

    posts.forEach((post) => {
      let isRetweeted = '';
      let replyFlag = '';
      let buttons = '';
      let mainPost = post;

      if (post.retweetData) {
        post = post.retweetData;
        isRetweeted = `<span>
              <i class='fas fa-retweet'></i>
              Retweeted by <a href="/profile/${mainPost.postedBy.username}">@${mainPost.postedBy.username}</a>
              </span>`;
      }

      if (post.replyTo) {
        const replyToUsername = post.replyTo.postedBy.username;
        replyFlag = `<div class="replyFlag">
              Replying to <a href="/profile/${replyToUsername}">@${replyToUsername}</a>
            </div>`;
      }

      if (post.postedBy._id === res.data.user._id) {
        let pinnedClass = '';
        if (post.pinned === true) {
          pinnedClass = 'class="pinButton active"';
        } else {
          pinnedClass = 'class="pinButton"';
        }

        buttons = `<button ${pinnedClass} data-id="${post._id}" data-toggle="modal" data-target="#confirmPinModal"><i class="fas fa-thumbtack"></i></button>
          <button data-id="${post._id}" data-toggle="modal" data-target="#deletePostModal"><i class="fas fa-times"></i></button>
          `;
      }

      html += `<div class="post" data-id="${post._id}">
                      <div class="postActionContainer">
                        ${isRetweeted || ''}                      
                      </div>
                      <div class="mainContentContainer"> 
                        <div class="userImageContainer">
                          <img src="${post.postedBy.photo}">
                        </div>
                        <div class="postContentContainer">
                          <div class="header">
                            <a href="/profile/${
                              post.postedBy.username
                            }" class="displayName">${post.postedBy.firstname} ${
        post.postedBy.lastname
      }</a>
                            <span class="username">@${
                              post.postedBy.username
                            }</span>
                            <span class="date">${timeDifference(
                              new Date(),
                              new Date(post.createdAt)
                            )}</span>
                            ${buttons || ''}
                          </div>
                          ${replyFlag || ''}
                          <div class="postBody">
                            <span>${post.content}</span>
                          </div>
                          <div class="postFooter">
                             <div class="postButtonContainer">
                              <button data-toggle="modal" data-target="#replyModal">
                                <i class='far fa-comment'></i>
                              </button>
                            </div>
                            <div class="postButtonContainer green">
                              <button ${
                                post.retweetUsers.includes(res.data.user._id)
                                  ? 'class="retweetButton active"'
                                  : 'class="retweetButton"'
                              }>
                                <i class='fas fa-retweet'></i>
                                <span>${post.retweetUsers.length || ''}</span>
                              </button>
                            </div>
                            <div class="postButtonContainer red">
                              <button ${
                                post.likes.includes(res.data.user._id)
                                  ? 'class="likeButton active"'
                                  : 'class="likeButton"'
                              }>
                                <i class='far fa-heart'></i>
                                <span>${post.likes.length || ''}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      </div>`;

      container.innerHTML = html;
    });
  } else {
    container.innerHTML = '<span class="noResults">No results</span>';
  }
};

const renderSearchUser = (res, container) => {
  if (res.data.users.length > 0) {
    const users = res.data.users;
    let html = '';

    users.forEach((user) => {
      let followButton = '';
      if (user._id == res.data.userRequest._id) {
        return;
      } else {
        const buttonClass = userRequestJS.following.includes(user._id)
          ? 'class= "followButton following"'
          : 'class= "followButton"';
        const buttonText = userRequestJS.following.includes(user._id)
          ? 'Following'
          : 'Follow';

        followButton = `<div class="followButtonContainer">
              <button ${buttonClass} data-user="${user._id}">${buttonText}</button>
          </div>`;
      }

      html += `<div class="user">
            <div class="userImageContainer">
                <img src="${user.photo}">
            </div>
            <div class="userDetailsContainer">
                <div class="header">
                    <a href="/profile/${user.username}">${user.firstname} ${user.lastname}</a>
                    <span class="username">@${user.username}</span>
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
