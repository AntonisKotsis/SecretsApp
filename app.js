//jshint esversion:6
require("dotenv").config();
const express=require("express");
const bodyParser=require("body-parser");
const ejs =require("ejs");
const mongoose=require("mongoose");
const encrypt=require("mongoose-encryption");

const session =require("express-session");
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");

const app=express();

app.use(express.static("public") );
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({
  extended:true
}));

//create a new session
app.use(session({
  secret:"Thisisasecret",
  resave:false,
  saveUnitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());


mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser:true})

//Creating the schema for the User
const userSchema=new mongoose.Schema({
  email:String,
  password:String
});

userSchema.plugin(passportLocalMongoose);
//Creating the model for the User
const User=new mongoose.model("User",userSchema);

//create the strategy
passport.use(User.createStrategy());
//create the cookie
passport.serializeUser(User.serializeUser());
//'break' the cookie to reveal what is inside for the user
passport.deserializeUser(User.deserializeUser());

app.get("/",function(req,res){
  res.render("home");
});

app.get("/login",function(req,res){
  res.render("login");
});

app.get("/register",function(req,res){
  res.render("register");

})

// User with an active session (cookie) can access the secret page by typing /secrets at the URL
// without re login
//session is over and user must login again when browser is either restarted or terminated
app.get("/secrets",function(req,res){

  //if the session is active
  if(req.isAuthenticated()){
    res.render("secrets");
  }
  else {
    res.redirect("/login");
  }
});

app.get("/logout",function(req,res){

  req.logout(function(err){
    if(err){
      console.log(err);
    }
    else{
      res.redirect("/");

    }
  });
});

//Render sign up page
app.post("/register",function(req,res){
  //register the user to database
  User.register({username:req.body.username},req.body.password,function(err,user){
    if(err){
      console.log(err);
      res.redirect("/register");
    }
    else{
      passport.authenticate("local")(req,res,function(){
        res.redirect("/secrets");
      });
    }
  });
});

//Render login page
app.post("/login",function(req,res){
  const user=new User({
    username:req.body.username,
    password:req.body.password
  })

  req.login(user,function(err){
    if(err){
      console.log(err);

    }
    else{
      passport.authenticate("local")(req,res,function(){
        res.redirect("/secrets");
      });
    }
  })

});

app.listen(3000,function(){
  console.log("Server is running at port 3000");
})
