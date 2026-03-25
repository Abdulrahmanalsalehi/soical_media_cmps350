function getUsers(){
    return JSON.parse(localStorage.getItem("users")) || [];
}
function saveUsers(users){
    localStorage.setItem("users", JSON.stringify(users));
}


function isEmailValid(email){
    var pattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
    return pattern.test(email);
}
function isPasswordStrong(password){
    var pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return pattern.test(password);
}

var default_pic = "media/profile-picture.png";

var sign_up = document.getElementById("sign-up");
var sign_in = document.getElementById("sign-in");

if (sign_up) {
  sign_up.addEventListener("click", function() {
    window.location.href = "register.html";
  });
}
if (sign_in) {
  sign_in.addEventListener("click", function() {
    window.location.href = "login.html";
  });
}



var register_form = document.querySelector(".register-page form")
if(register_form){

    register_form.addEventListener("submit", function(e) {

        e.preventDefault();

        var fullname = document.getElementById("fullname").value.trim();
        var username =  document.getElementById("username").value.trim();
        var email = document.getElementById("email").value.trim();
        var phone = document.getElementById("phone").value.trim();
        var password = document.getElementById("password").value.trim();
        var confirmedpassword = document.getElementById("confirm-password").value.trim();

        if(!isEmailValid(email)){
            alert("Invalid email format");
            return;
        }
        if(!isPasswordStrong(password)){
            alert("Password must be at least 8 characters, include uppercase, lowercase and a number");
            return;
        }
        if(password != confirmedpassword){
            alert("Passwords do not match");
            return;
        }

        var users = getUsers();

        var emailExists = users.some(function(user) { return user.email == email; });
        if(emailExists){
          alert("Email already registered");
          return;
        }

        var user = {
            id: Date.now(),
            fullname: fullname,
            username: username,
            email: email,
            phone: phone,
            password: password,
            profilePic: default_pic,
            bio: "",
            posts: [],
            followers: [],
            following: [],
        }
        users.push(user);
        saveUsers(users);

        window.location.href = "login.html";

    });
}

var login_form = document.querySelector(".login-page form")
if(login_form){
    login_form.addEventListener("submit", function(e) {
        e.preventDefault();

        var email = document.getElementById("email").value.trim()
        var password = document.getElementById("password").value.trim()
        var users = getUsers();

        var validate_user = users.find(function(user) { return user.email == email && user.password == password; });
        if(!validate_user){
            alert("Invalid email or password");
            return;
        }
        localStorage.setItem("LoggedInUser", JSON.stringify(validate_user));
        window.location.href = "home.html";


   });
}
