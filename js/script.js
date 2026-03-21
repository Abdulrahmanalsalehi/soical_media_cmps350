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