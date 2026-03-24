/*********************** functions to deal with browser storage ***********************/
function loadUsers() {
  return JSON.parse(localStorage.getItem("users")) || [];
}
function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}
function getLoggedIntUser() {
  return JSON.parse(localStorage.getItem("LoggedInUser"));
}
function setLoggedIntUser(user) {
  localStorage.setItem("LoggedInUser", JSON.stringify(user));
}
let users = loadUsers();

/*********************** home page header ***********************/
function loadHeaderProfile() {

  users = loadUsers();

  const user = getLoggedIntUser(); 
  if (!user)
    return;
  // show current user stats who is logged in
  const posts = document.getElementById("posts-count");
  const followers = document.getElementById("followers-count");
  const following = document.getElementById("following-count");

  if (posts)
    posts.textContent = user.posts ? user.posts.length : 0;

  if (followers)
    followers.textContent = user.followers ? user.followers.length : 0;
    
  if (following)
    following.textContent = user.following ? user.following.length : 0;

  if (document.getElementById("username-header"))
    document.getElementById("username-header").textContent = user.username;

  if (document.getElementById("profile-pic") && user.profilePic)
    document.getElementById("profile-pic").src = user.profilePic;
}


/*********************** Navigation options ***********************/
const logout_window = document.getElementById("logout-window");
const logout_header = document.getElementById("logout-header");
const yes = document.getElementById("Yes");
const no = document.getElementById("No");
const nav_profile = document.getElementById("nav-profile");
const nav_home = document.getElementById("nav-home");
const all_posts = document.getElementById("all-posts");
const following_posts = document.getElementById("following-posts");
// redirect based on what user select
if (logout_header)
  logout_header.addEventListener("click", () => {
    logout_window.style.display = "flex";
  });

if (yes)
  yes.addEventListener("click", () => {
    localStorage.removeItem("LoggedInUser");
    window.location.href = "login.html";
  });

if (no)
  no.addEventListener("click", () => {
    logout_window.style.display = "none";
  });

if(nav_profile){
  nav_profile.addEventListener("click", () => {
    window.location.href = "profile.html";
  });
}
if(nav_home){
   nav_home.addEventListener("click", () => {
   window.location.href = "home.html";
  });
}
if (all_posts) {
  all_posts.addEventListener("click", () => {
    feedMode = "all";
    all_posts.classList.add("active");
    following_posts.classList.remove("active");
    showFeeds();
  });
}
if (following_posts) {
  following_posts .addEventListener("click", () => {
    feedMode = "following";
    following_posts.classList.add("active");
    all_posts.classList.remove("active");
    showFeeds();
  });
}



/*********************** redirect to user profile  ***********************/
const usernameHeader = document.getElementById("username-header");
const profilePicHeader = document.getElementById("profile-pic");

// when username or pic is selected it redirect to the loggedIn user profile 
if (usernameHeader)
  usernameHeader.addEventListener("click", () => {
    const loggedUser = getLoggedIntUser();
    localStorage.setItem("viewUser", loggedUser.username);

    window.location.href = "profile.html";
  });
if (profilePicHeader)
  profilePicHeader.addEventListener("click", () => {
    const loggedUser = getLoggedIntUser();
    localStorage.setItem("viewUser", loggedUser.username);

    window.location.href = "profile.html";
  });


/*********************** create post  ***********************/
const post_button = document.getElementById("post-button");

if (post_button) {
  post_button.addEventListener("click", () => {
    // collect post content from user input
    const input = document.getElementById("post-input");
    const content = input.value.trim();
    if (!content) 
      return;

    const loggedUser = getLoggedIntUser();
    const userIndex = users.findIndex(u => u.username === loggedUser.username);
    // create a new post then push it to user posts list 
    const newPost = {
      id: Date.now(),
      content,
      timestamp: new Date().toLocaleString(),
      likes: [],
      comments: []
    };
    users[userIndex].posts.push(newPost);

    saveUsers(users);
    setLoggedIntUser(users[userIndex]);

    input.value = ""; // clear 

    loadHeaderProfile();
    showFeeds();
  });
}

/*********************** display main feed  ***********************/
function showFeeds() {

  users = loadUsers();

  const feed = document.getElementById("feed");
  if (!feed) return;

  feed.innerHTML = "";
  // create empty list for posts then push user posts to it 
  let allPosts = [];
  const loggedUser = getLoggedIntUser();

  users.forEach(user => {

    // If following filter is active
    if (feedMode === "following") {
      if (!loggedUser.following || !loggedUser.following.includes(user.username)) {
        return; // skip users not followed
      }
    }

    if (user.posts) {
      user.posts.forEach(post => {
        allPosts.push({
          ...post,
          username: user.username,
          profilePic: user.profilePic
        });
      });
    }
  });

  // sort according to timestamp, most recent apear at the top
  allPosts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  // for each post a div will be created including all details of a post
  allPosts.forEach(post => {
    const post_element = document.createElement("div");
    post_element.classList.add("post");

    post_element.innerHTML = `
      <div class="post-header">
        <img src="${post.profilePic}" class="default-pic-post">
        <div>
          <div class="post-username">${post.username}</div>
          <div class="timestamp">${post.timestamp}</div>
        </div>

        ${getLoggedIntUser().username === post.username 
            ? `<img src="media/trash-2 (2).svg" class="delete-post">`
            : ""
          }

      </div>

      <div class="post-content">${post.content}</div>

      <div class="post-actions">
        <button class="like">
          <img src="media/heart.svg">
          <span class="like-count">${post.likes ? post.likes.length : 0}</span>
        </button>

        <button class="comment">
          <img src="media/message-circle.svg">
          <span class="comment-count">${post.comments ? post.comments.length : 0}</span>
        </button>
      </div>
    `;

    feed.appendChild(post_element);
    // show the post in more details if user clicked on it
    post_element.addEventListener("click", () => openPost(post));

    const username = post_element.querySelector(".post-username");
    const pic = post_element.querySelector(".default-pic-post");
    const likeBtn = post_element.querySelector(".like");
    const commentBtn = post_element.querySelector(".comment");
    const likeCount = post_element.querySelector(".like-count");
    const delete_post = post_element.querySelector(".delete-post");
    
    // redirect to the selected user profile
    username.addEventListener("click", (e) => {
      e.stopPropagation();
      localStorage.setItem("viewUser", post.username);
      window.location.href = "profile.html";
    });
    pic.addEventListener("click", (e) => {
      e.stopPropagation();
      localStorage.setItem("viewUser", post.username);
      window.location.href = "profile.html";
    });
    // updated like counter 
    likeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleLike(post, likeCount);
    });
    commentBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      openPost(post, true); // <-- second argument true shows comments
    });

    // call delete post if user clicked on trash icon 
    if(delete_post){
      delete_post.addEventListener("click", (e) => {
        e.stopPropagation();
        deletePost(post);

      });
    }

  });
}

/*********************** delete post  ***********************/

function deletePost(post){
  users = loadUsers();
  const loggedUser = getLoggedIntUser();

  if(loggedUser.username !== post.username){
    return;
  }
  // get the user who the post belongs to 
  const userIndex = users.findIndex(u => u.username === post.username);
  if(userIndex === -1) return;
  // filter out from the posts list if id matches
  users[userIndex].posts = users[userIndex].posts.filter(
    p => p.id !== post.id
  );

  saveUsers(users); 
  setLoggedIntUser(users[userIndex]);

  const feed = document.getElementById("feed");
  if (feed) {
    feed.innerHTML = ""; // clear
    showFeeds();         // update
  }

  const myPosts = document.getElementById("my-posts");
  if (myPosts) {
    myPosts.innerHTML = ""; // clear
    showUserPosts();        // update
  }

  // update the UI accordingly 
  loadHeaderProfile();
  loadProfile();
  showFeeds();
  showUserPosts();
}



/*********************** like funtionality  ***********************/
function toggleLike(post, likeCount) {
  users = loadUsers();
  const loggedUser = getLoggedIntUser();
  // find who ownes the post and the index of post itself
  const ownerIndex = users.findIndex(u => u.username === post.username);
  const postIndex = users[ownerIndex].posts.findIndex(p => p.id === post.id);
  // use the indexes to retrieve it from storagee
  const realPost = users[ownerIndex].posts[postIndex];
  

  if (!realPost.likes) 
    realPost.likes = [];
  const likeIndex = realPost.likes.indexOf(loggedUser.username);
  // if no likes apear 
  if (likeIndex === -1)
    realPost.likes.push(loggedUser.username);
  else // or remove the user if clicked 
    realPost.likes.splice(likeIndex, 1);
  
  // update post object to reflect changes
  post.likes = realPost.likes;

  saveUsers(users);
  const updatedLoggedUser = users.find(u => u.username === loggedUser.username);
  setLoggedIntUser(updatedLoggedUser);
  // when clicked show the new number of likes 
  if (likeCount)
    likeCount.textContent = realPost.likes.length;
  // UI update
  showFeeds();
  showUserPosts();
}

/*********************** show post in details  ***********************/
function openPost(post, showComments = false) {
  // a new window will apear when a user click on a post
  const post_window = document.getElementById("post-window");
  if (!post_window) return;

  document.getElementById("comments-list").innerHTML = ""; // clear 
  document.getElementById("comments-section").style.display = "none";

  document.getElementById("detail-profile-pic").src = post.profilePic;
  document.getElementById("detail-username").textContent = post.username;
  document.getElementById("detail-timestamp").textContent = post.timestamp;
  document.getElementById("detail-content").textContent = post.content;
  document.getElementById("comment-count").textContent = post.comments ? post.comments.length : 0;

  post_window.style.display = "flex";

  document.getElementById("arrow-back").onclick = () => {
    post_window.style.display = "none";
  };
  // show likes and comments 
  document.getElementById("detail-like").onclick = () => {
    const likeCount = document.getElementById("like-count");
    toggleLike(post, likeCount);
  };
  document.getElementById("like-count").textContent = post.likes ? post.likes.length : 0;
  
  // display comment section if user clicks on comment
  document.getElementById("detail-comment").onclick = (e) => {
    e.stopPropagation();
    const section = document.getElementById("comments-section");
     
      if (section.style.display === "block") {
        section.style.display = "none";
      } else {
        section.style.display = "block";
        renderComments(post);
       }
  };

  // call addComment function if user inserted a coment 
  document.getElementById("comment-button").onclick = () => {
    addComment(post);
  };
   if (showComments) {
    const section = document.getElementById("comments-section");
    section.style.display = "block";
    renderComments(post);
  }

}


/*********************** display comments  ***********************/
function renderComments(post) {

  const list = document.getElementById("comments-list");
  list.innerHTML = "";

  if (!post.comments || post.comments.length === 0) return;

  post.comments.forEach(comment => {

    const box = document.createElement("div");
    box.classList.add("comment-box");

    box.innerHTML = `
      <div class="comment-header">
        <img src="${comment.profilePic}" class="default-pic-post">
        <div>
          <div class="post-username">${comment.username}</div>
          <div class="timestamp">${comment.timestamp}</div>
        </div>
      </div>

      <div class="comment-content">${comment.content}</div>
    `;

    list.appendChild(box);

  });

}

/*********************** add comment to a post  ***********************/

function addComment(post) {

  const input = document.getElementById("comment-input");
  const content = input.value.trim();
  if (!content) return;

  const loggedUser = getLoggedIntUser();

  const ownerIndex = users.findIndex(u => u.username === post.username);
  const postIndex = users[ownerIndex].posts.findIndex(p => p.id === post.id);

  const newComment = {
    content,
    timestamp: new Date().toLocaleString(),
    username: loggedUser.username,
    profilePic: loggedUser.profilePic
  };

  if(!users[ownerIndex].posts[postIndex].comments){
   users[ownerIndex].posts[postIndex].comments = [];
  }

  users[ownerIndex].posts[postIndex].comments.push(newComment);

  const updatedPost = users[ownerIndex].posts[postIndex];

  saveUsers(users);

  input.value = "";

  renderComments(updatedPost);

  document.getElementById("comment-count").textContent = updatedPost.comments.length;

  showFeeds();
  showUserPosts();
}