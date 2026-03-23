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