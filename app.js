//jshint esversion:6
const express=require("express");
const bodyParser=require("body-parser");
const ejs =require("ejs");
const mongoose=require("mongoose");
const encrypt=require("mongoose-encryption");
const app=express();

app.use(express.static("public") );
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({
  extended:true
}));


mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser:true})

//Creating the schema for the User
const userSchema={
  email:String,
  password:String
}



//Creating the model for the User
const User=new mongoose.model("User",userSchema);

app.get("/",function(req,res){
  res.render("home");
});

app.get("/login",function(req,res){
  res.render("login");
});

app.get("/register",function(req,res){
  res.render("register");
})

//Render sign up page
app.post("/register",function(req,res){
  //Create a new user
  const newUser=new User({
    email:req.body.username,
    password:req.body.password
  });
  //Try to save the user in the DB
  newUser.save(function(err){
    if(err){
      console.log(err);
    //if we manage to save the user the render the Secrets page that is only avalaible to the registered users
    }else{
      res.render("secrets")
    }
  })
});

//Render login page
app.post("/login",function(req,res){
  //get the user credentials from the form
  const username=req.body.username;
  const password=req.body.password;

  //search the DB to find the username of the given user
  User.findOne({email:username},function(err,foundUser){
    if(err){
      console.log(err)
    }
    else{
      //if we find the username in our DB then we check if the password that has been given is correct
      if(foundUser){
        if(foundUser.password===password){
          //and if it matches then render the secrets page cause the user has logged in
          res.render("secrets");
        }
      }
    }
  })
});

app.listen(3000,function(){
  console.log("Server is running at port 3000");
})
