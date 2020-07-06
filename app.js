require('dotenv').config(); // to use environment variables 
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
mongoose.connect('mongodb://localhost:27017/userDB', {useNewUrlParser: true});

// this will print whatever written on API_KEY in .env file
console.log(process.env.API_KEY);


// const userSchema = new{
    // now we are writing a mongoose schema not only as a js object
    const userSchema = new mongoose.Schema({
    email: String,
    password: String
})

// using Encryption in Mongoose. It will encrypt when it call save and decrypt when it call find
// var secret = "Thisisourlittlesecret";
// now we get secret from our .env file
userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"]});

const User = new mongoose.model("User", userSchema);

app.get("/", (req, res)=>{
    res.render("home");
});
app.get("/login", (req, res)=>{
    res.render("login");
});
app.get("/register", (req, res)=>{
    res.render("register");
});

// now get whatever user write on register page
app.post("/register", (req, res)=>{
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });
    newUser.save((err)=>{   
        if(!err){
            // allow to use secrets page when they are registered
            res.render("secrets");
        }
    });
});

// now for login page
app.post("/login", (req, res)=>{
    const username = req.body.username;
    const password = req.body.password;

    // check the user already registered or not match email(in our database) with username(whatever user type)
    User.findOne({email: username}, (err, foundUser)=>{
        if (err) {
            console.log(err);
            
        } else {
            if(foundUser){
                // now match password
                if(foundUser.password === password){
                    res.render("secrets");
                }
            }
        }
    })
});



app.listen(3000, ()=>{
    console.log("Server is starting at port 3000");
})