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

const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
const findOrCreate=require("mongoose-findorcreate");

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
  password:String,
  googleId:String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);


//Creating the model for the User
const User=new mongoose.model("User",userSchema);

//create the strategy
passport.use(User.createStrategy());
//create the cookie
passport.serializeUser(function(user,done){
  done(null,user);
});
//'break' the cookie to reveal what is inside for the user
passport.deserializeUser(function(user,done){
  done(null,user);
});


passport.use(new GoogleStrategy({
    clientID:     process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL:"https://www.googleapis.com/oauth2/v3/userinfo",
    passReqToCallback   : true
  },
  function(request, accessToken, refreshToken, profile, done) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return done(err, user);
    });
  }
));

app.get("/",function(req,res){
  res.render("home");
});

//this get is called by the sing up button
app.get("/auth/google",
  passport.authenticate("google",{scope:['profile']})
);

//when we choose the google account that we want to login
//then we get redirected to URL we defined in the google console
//which '/auth/google/callback_function'

app.get( "/auth/google/secrets",
    passport.authenticate( 'google', {
        successRedirect: '/secrets',
        failureRedirect: '/login'
}));
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
