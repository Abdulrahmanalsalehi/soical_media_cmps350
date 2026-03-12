
function getUsers(){
    return JSON.parse(localStorage.getItem("users")) || []; 
}

// save users in localStorage 
function saveUsers(users){
    localStorage.setItem("users", JSON.stringify(users));

}

function isEmailValid(email){
    const pattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
    return pattern.test(email);

}

function isPasswordStrong(password){
    const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return pattern.test(password);
}

const default_pic = "media/profile-picture.png";


// **** Validate inputs in register ****

// target register form in html doucment
const register_form = document.querySelector(".register-page form") 
if(register_form){

    register_form.addEventListener("submit", function(e) {
        
        e.preventDefault();
        
        // collecting values from user registraion 
        const fullname = document.getElementById("fullname").value;
        const username =  document.getElementById("username").value;
        const email = document.getElementById("email").value;
        const phone = document.getElementById("phone").value;
        const password = document.getElementById("password").value;
        const confirmedpassword = document.getElementById("confirm-password").value;
       
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

// **** Validate inputs in login ****

const login_form = document.querySelector(".login-page form") 
if(login_form){
    login_form.addEventListener("submit", function(e) {
        e.preventDefault();

        const email = document.getElementById("email").value.trim()
        const password = document.getElementById("password").value.trim()
        const users = getUsers();

        const validate_user = users.find(user => user.email === email && user.password === password);
        if(!validate_user){
            alert("Invalid email or password");
            return;
        }
        localStorage.setItem("LoggedInUser", JSON.stringify(validate_user));
        window.location.href = "home.html";


   });
}