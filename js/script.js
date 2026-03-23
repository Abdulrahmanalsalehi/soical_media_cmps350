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

