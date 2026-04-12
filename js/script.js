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
var users = loadUsers();


function loadHeaderProfile() {

  users = loadUsers();

  var user = getLoggedIntUser();
  if (!user)
    return;

  var posts = document.getElementById("posts-count");
  var followers = document.getElementById("followers-count");
  var following = document.getElementById("following-count");

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


var logout_window = document.getElementById("logout-window");
var logout_header = document.getElementById("logout-header");
var yes = document.getElementById("Yes");
var no = document.getElementById("No");
var nav_profile = document.getElementById("nav-profile");
var nav_home = document.getElementById("nav-home");
var all_posts = document.getElementById("all-posts");
var following_posts = document.getElementById("following-posts");

if (logout_header)
  logout_header.addEventListener("click", function() {
    logout_window.style.display = "flex";
  });

if (yes)
  yes.addEventListener("click", function() {
    localStorage.removeItem("LoggedInUser");
    window.location.href = "login.html";
  });

if (no)
  no.addEventListener("click", function() {
    logout_window.style.display = "none";
  });

if(nav_profile){
  nav_profile.addEventListener("click", function() {
    window.location.href = "profile.html";
  });
}
if(nav_home){
   nav_home.addEventListener("click", function() {
   window.location.href = "home.html";
  });
}
if (all_posts) {
  all_posts.addEventListener("click", function() {
    feedMode = "all";
    all_posts.classList.add("active");
    following_posts.classList.remove("active");
    showFeeds();
  });
}
if (following_posts) {
  following_posts.addEventListener("click", function() {
    feedMode = "following";
    following_posts.classList.add("active");
    all_posts.classList.remove("active");
    showFeeds();
  });
}



var usernameHeader = document.getElementById("username-header");
var profilePicHeader = document.getElementById("profile-pic");

if (usernameHeader)
  usernameHeader.addEventListener("click", function() {
    var loggedUser = getLoggedIntUser();
    localStorage.setItem("viewUser", loggedUser.username);

    window.location.href = "profile.html";
  });
if (profilePicHeader)
  profilePicHeader.addEventListener("click", function() {
    var loggedUser = getLoggedIntUser();
    localStorage.setItem("viewUser", loggedUser.username);

    window.location.href = "profile.html";
  });


function showFeeds() {

  users = loadUsers();

  var feed = document.getElementById("feed");
  if (!feed) return;

  feed.innerHTML = "";

  var allPosts = [];
  var loggedUser = getLoggedIntUser();

  users.forEach(function(user) {

    if (feedMode === "following") {
      if (!loggedUser.following || !loggedUser.following.includes(user.username)) {
        return;
      }
    }

    if (user.posts) {
      user.posts.forEach(function(post) {
        allPosts.push({
          ...post,
          username: user.username,
          profilePic: user.profilePic
        });
      });
    }
  });

  allPosts.sort(function(a, b) { return new Date(b.timestamp) - new Date(a.timestamp); });

  allPosts.forEach(function(post) {
    var post_element = document.createElement("div");
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

    post_element.addEventListener("click", function() { openPost(post); });

    var username = post_element.querySelector(".post-username");
    var pic = post_element.querySelector(".default-pic-post");
    var likeBtn = post_element.querySelector(".like");
    var commentBtn = post_element.querySelector(".comment");
    var likeCount = post_element.querySelector(".like-count");
    var delete_post = post_element.querySelector(".delete-post");

    username.addEventListener("click", function(e) {
      e.stopPropagation();
      localStorage.setItem("viewUser", post.username);
      window.location.href = "profile.html";
    });
    pic.addEventListener("click", function(e) {
      e.stopPropagation();
      localStorage.setItem("viewUser", post.username);
      window.location.href = "profile.html";
    });

    likeBtn.addEventListener("click", function(e) {
      e.stopPropagation();
      toggleLike(post, likeCount);
    });
    commentBtn.addEventListener("click", function(e) {
      e.stopPropagation();
      openPost(post, true);
    });

    if(delete_post){
      delete_post.addEventListener("click", function(e) {
        e.stopPropagation();
        deletePost(post);

      });
    }

  });
}


function deletePost(post){
  users = loadUsers();
  var loggedUser = getLoggedIntUser();

  if(loggedUser.username !== post.username){
    return;
  }

  var userIndex = users.findIndex(function(u) { return u.username == post.username; });
  if(userIndex === -1) return;

  users[userIndex].posts = users[userIndex].posts.filter(function(p) {
    return p.id !== post.id;
  });

  saveUsers(users);
  setLoggedIntUser(users[userIndex]);

  var feed = document.getElementById("feed");
  if (feed) {
    feed.innerHTML = "";
    showFeeds();
  }

  var myPosts = document.getElementById("my-posts");
  if (myPosts) {
    myPosts.innerHTML = "";
    showUserPosts();
  }

  loadHeaderProfile();
  loadProfile();
  showFeeds();
  showUserPosts();
}



var post_button = document.getElementById("post-button");

if (post_button) {
  post_button.addEventListener("click", function() {

    var input = document.getElementById("post-input");
    var content = input.value.trim();
    if (!content)
      return;

    var loggedUser = getLoggedIntUser();
    var userIndex = users.findIndex(function(u) { return u.username == loggedUser.username; });

    var newPost = {
      id: Date.now(),
      content: content,
      timestamp: new Date().toLocaleString(),
      likes: [],
      comments: []
    };
    users[userIndex].posts.push(newPost);

    saveUsers(users);
    setLoggedIntUser(users[userIndex]);

    input.value = "";

    loadHeaderProfile();
    showFeeds();
  });
}


function toggleLike(post, likeCount) {
  users = loadUsers();
  var loggedUser = getLoggedIntUser();

  var ownerIndex = users.findIndex(function(u) { return u.username == post.username; });
  var postIndex = users[ownerIndex].posts.findIndex(function(p) { return p.id == post.id; });

  var realPost = users[ownerIndex].posts[postIndex];


  if (!realPost.likes)
    realPost.likes = [];
  var likeIndex = realPost.likes.indexOf(loggedUser.username);

  if (likeIndex === -1)
    realPost.likes.push(loggedUser.username);
  else
    realPost.likes.splice(likeIndex, 1);

  post.likes = realPost.likes;

  saveUsers(users);
  var updatedLoggedUser = users.find(function(u) { return u.username == loggedUser.username; });
  setLoggedIntUser(updatedLoggedUser);

  if (likeCount)
    likeCount.textContent = realPost.likes.length;

  showFeeds();
  showUserPosts();

}


function openPost(post, showComments) {
  if(showComments === undefined) showComments = false;

  var post_window = document.getElementById("post-window");
  if (!post_window) return;

  document.getElementById("comments-list").innerHTML = "";
  document.getElementById("comments-section").style.display = "none";

  document.getElementById("detail-profile-pic").src = post.profilePic;
  document.getElementById("detail-username").textContent = post.username;
  document.getElementById("detail-timestamp").textContent = post.timestamp;
  document.getElementById("detail-content").textContent = post.content;
  document.getElementById("comment-count").textContent = post.comments ? post.comments.length : 0;

  post_window.style.display = "flex";

  document.getElementById("arrow-back").onclick = function() {
    post_window.style.display = "none";
  };

  document.getElementById("detail-like").onclick = function() {
    var likeCount = document.getElementById("like-count");
    toggleLike(post, likeCount);
  };
  document.getElementById("like-count").textContent = post.likes ? post.likes.length : 0;

  document.getElementById("detail-comment").onclick = function(e) {
    e.stopPropagation();
    var section = document.getElementById("comments-section");

      if (section.style.display === "block") {
        section.style.display = "none";
      } else {
        section.style.display = "block";
        renderComments(post);
       }
  };

  document.getElementById("comment-button").onclick = function() {
    addComment(post);
  };
   if (showComments) {
    var section = document.getElementById("comments-section");
    section.style.display = "block";
    renderComments(post);
  }

}


function renderComments(post) {

  var list = document.getElementById("comments-list");
  list.innerHTML = "";

  if (!post.comments || post.comments.length === 0) return;

  post.comments.forEach(function(comment) {

    var box = document.createElement("div");
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

function addComment(post) {

  var input = document.getElementById("comment-input");
  var content = input.value.trim();
  if (!content) return;

  var loggedUser = getLoggedIntUser();

  var ownerIndex = users.findIndex(function(u) { return u.username == post.username; });
  var postIndex = users[ownerIndex].posts.findIndex(function(p) { return p.id == post.id; });

  var newComment = {
    content: content,
    timestamp: new Date().toLocaleString(),
    username: loggedUser.username,
    profilePic: loggedUser.profilePic
  };

  if(!users[ownerIndex].posts[postIndex].comments){
   users[ownerIndex].posts[postIndex].comments = [];
  }

  users[ownerIndex].posts[postIndex].comments.push(newComment);

  var updatedPost = users[ownerIndex].posts[postIndex];

  saveUsers(users);

  input.value = "";

  renderComments(updatedPost);

  document.getElementById("comment-count").textContent = updatedPost.comments.length;

  showFeeds();
  showUserPosts();
}


function loadProfile() {
  users = loadUsers();

  var viewUsername = localStorage.getItem("viewUser");
  var user = users.find(function(u) { return u.username == viewUsername; }) || getLoggedIntUser();
  if (!user)
    return;

  if (document.getElementById("editFullname"))
    document.getElementById("editFullname").value = user.fullname;

  if (document.getElementById("editUsername"))
    document.getElementById("editUsername").value = user.username;

  if (document.getElementById("editEmail"))
    document.getElementById("editEmail").value = user.email;

  if (document.getElementById("editPhone"))
    document.getElementById("editPhone").value = user.phone;

  if (document.getElementById("editBio"))
    document.getElementById("editBio").value = user.bio;

  if (document.getElementById("username"))
    document.getElementById("username").textContent = user.username;

  if (document.getElementById("bio"))
    document.getElementById("bio").textContent = user.bio || "This is my bio";

  document.getElementById("profile-posts").textContent =
  user.posts ? user.posts.length : 0;

  document.getElementById("profile-followers").textContent =
    user.followers ? user.followers.length : 0;

  document.getElementById("profile-following").textContent =
    user.following ? user.following.length : 0;

}


function editProfile(){
  users = loadUsers();

  var edit_window = document.getElementById("edit-window");
  var loggedUser = getLoggedIntUser();
  var viewUsername = localStorage.getItem("viewUser");
  var user = users.find(function(u) { return u.username == viewUsername; }) || loggedUser;

  var edit_Button = document.getElementById("edit");
  var follow_button = document.getElementById("follow-button");

  if (user.username === loggedUser.username) {
    edit_Button.style.display = "block";
    follow_button.style.display = "none";
  } else {
    edit_Button.style.display = "none";
    follow_button.style.display = "block";
  }

  edit_Button.addEventListener("click", function() {
    edit_window.style.display = "flex";
  });

  document.getElementById("cancel").addEventListener("click", function() {
    edit_window.style.display = "none";
  });



  document.getElementById("save").addEventListener("click", function() {
    users = loadUsers();
    var loggedInUser = getLoggedIntUser();

    var updatedUser = {
      ...loggedInUser,
      fullname: document.getElementById("editFullname").value.trim(),
      username: document.getElementById("editUsername").value.trim(),
      email: document.getElementById("editEmail").value.trim(),
      phone: document.getElementById("editPhone").value.trim(),
      bio: document.getElementById("editBio").value.trim(),
    };

    users = users.map(function(user) {
      return user.username === loggedInUser.username ? updatedUser : user;
    });

    saveUsers(users);
    setLoggedIntUser(updatedUser);

    edit_window.style.display = "none";

    loadProfile();
    loadHeaderProfile();
    showUserPosts();

  });

}


function showUserPosts() {
  users = loadUsers();

  var feed = document.getElementById("my-posts");
  if (!feed) return;

  feed.innerHTML = "";

  var viewUsername = localStorage.getItem("viewUser");
  var loggedUser = getLoggedIntUser();
  var user = users.find(function(u) { return u.username == viewUsername; }) || loggedUser;

  if (!user.posts) return;

  if (document.getElementById("my-posts-heading"))
    document.getElementById("my-posts-heading").textContent = user.username + "'s posts";

  var userPosts = user.posts.map(function(post) {
    return {
      ...post,
      username: user.username,
      profilePic: user.profilePic
    };
  });
  userPosts.sort(function(a, b) { return new Date(b.timestamp) - new Date(a.timestamp); });

  userPosts.forEach(function(post) {

    var post_element = document.createElement("div");
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

    post_element.addEventListener("click", function() { openPost(post); });

    var like_button = post_element.querySelector(".like");
    var like_count = post_element.querySelector(".like-count");
    var post_username = post_element.querySelector(".post-username");
    var post_pic = post_element.querySelector(".default-pic-post");
    var delete_post = post_element.querySelector(".delete-post");

     post_username.addEventListener("click", function(e) {
      e.stopPropagation();
      localStorage.setItem("viewUser", post.username);
      window.location.href = "profile.html";
    });

    post_pic.addEventListener("click", function(e) {
      e.stopPropagation();
      localStorage.setItem("viewUser", post.username);
      window.location.href = "profile.html";
    });


    like_button.addEventListener("click", function(e) {
      e.stopPropagation();
      toggleLike(post, like_count);
    });
    if(delete_post){
      delete_post.addEventListener("click", function(e) {
        e.stopPropagation();
        deletePost(post);
      });
    }

  });

}



function followUser() {
  var loggedUser = getLoggedIntUser();
  var viewUsername = localStorage.getItem("viewUser");

  if (!viewUsername || viewUsername === loggedUser.username) return;

  users = loadUsers();

  var viewedIndex = users.findIndex(function(u) { return u.username == viewUsername; });
  var loggedIndex = users.findIndex(function(u) { return u.username == loggedUser.username; });

  if (viewedIndex === -1 || loggedIndex === -1) return;

  var viewedUser = users[viewedIndex];
  var currentUser = users[loggedIndex];

  if (!viewedUser.followers) viewedUser.followers = [];
  if (!currentUser.following) currentUser.following = [];

  var isFollowing = viewedUser.followers.includes(loggedUser.username);

  if (isFollowing) {
    viewedUser.followers = viewedUser.followers.filter(function(u) { return u !== loggedUser.username; });
    currentUser.following = currentUser.following.filter(function(u) { return u !== viewUsername; });
  } else {
    viewedUser.followers.push(loggedUser.username);
    currentUser.following.push(viewUsername);
  }

  saveUsers(users);

  setLoggedIntUser(currentUser);

  updateFollowButton();
  loadHeaderProfile();
  loadProfile();
}


function updateFollowButton() {

  var btn = document.getElementById("follow-button");
  if (!btn) return;

  var users = loadUsers();

  var viewUsername = localStorage.getItem("viewUser");
  var loggedUser = getLoggedIntUser();

  if (!viewUsername || viewUsername === loggedUser.username) {
    btn.style.display = "none";
    return;
  }

  var viewedUser = users.find(function(u) { return u.username == viewUsername; });

  var isFollowing = viewedUser.followers &&
    viewedUser.followers.includes(loggedUser.username);

  btn.textContent = isFollowing ? "Unfollow" : "Follow";

  btn.onclick = followUser;

}



loadHeaderProfile();
feedMode = "all";
if (all_posts) {
  all_posts.classList.add("active");
  showFeeds();
}

if (following_posts) {
  following_posts.classList.remove("active");
}


showFeeds();
loadProfile();
editProfile();
showUserPosts();
updateFollowButton();
