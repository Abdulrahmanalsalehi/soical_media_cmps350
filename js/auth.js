// for localStorage
function getUsers(){
    return JSON.parse(localStorage.getItem("users")) || []; 
}
function saveUsers(users){
    localStorage.setItem("users", JSON.stringify(users));
}


// validate input for email and password
function isEmailValid(email){
    const pattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
    return pattern.test(email);
}
function isPasswordStrong(password){
    const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return pattern.test(password);
}

// make this the default pic for every user
const default_pic = "media/profile-picture.png";

//  rediret 
const sign_up = document.getElementById("sign-up");
const sign_in = document.getElementById("sign-in");

if (sign_up) {
  sign_up.addEventListener("click", () => {
    window.location.href = "register.html";
  });
}
if (sign_in) {
  sign_in.addEventListener("click", () => {
    window.location.href = "login.html";
  });
}





// target register form in html doucment
const register_form = document.querySelector(".register-page form") 
if(register_form){

    register_form.addEventListener("submit", function(e) {
        
        e.preventDefault();
        
        // collecting values from user registraion 
        const fullname = document.getElementById("fullname").value.trim();
        const username =  document.getElementById("username").value.trim();
        const email = document.getElementById("email").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const password = document.getElementById("password").value.trim();
        const confirmedpassword = document.getElementById("confirm-password").value.trim();
       
        // show aproperiate messages
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
        
        let users = getUsers();
        
        // compare with emails on localStorage
        const emailExists = users.some(user => user.email === email);
        if(emailExists){
          alert("Email already registered");
          return;
        }

        //create an object once validation is passed 
        const user = {
            id: Date.now(),
            fullname,
            username,
            email,
            phone,
            password,
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

//  Validate inputs in login 
const login_form = document.querySelector(".login-page form") 
if(login_form){
    login_form.addEventListener("submit", function(e) {
        e.preventDefault();

        const email = document.getElementById("email").value.trim()
        const password = document.getElementById("password").value.trim()
        const users = getUsers();

        const validate_user = users.find(user => user.email === email && user.password === password);
        // must match with localStorage
        if(!validate_user){ 
            alert("Invalid email or password");
            return;
        }
        localStorage.setItem("LoggedInUser", JSON.stringify(validate_user));
        window.location.href = "home.html";


   });
}