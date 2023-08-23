const renderHomePage = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://localhost:8001/api/v1/posts',
    });

    if (res.data.status === 'success') {
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

          document.querySelector('.postContainer').innerHTML = html;
        });
      }
    }
  } catch (error) {
    handleLogout(error);
  }
};

renderHomePage();
