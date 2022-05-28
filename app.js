//jshint esversion:6
require("dotenv").config();
const express=require("express");
const bodyParser=require("body-parser");
const ejs =require("ejs");
const mongoose=require("mongoose");
const encrypt=require("mongoose-encryption");
const md5=require("md5");
const bcrypt=require("bcrypt");
const app=express();
const saltRound=3;
app.use(express.static("public") );
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({
  extended:true
}));


mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser:true})

//Creating the schema for the User
const userSchema=new mongoose.Schema({
  email:String,
  password:String
});


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
  bcrypt.hash(req.body.password,saltRound,function(err,hash){
    const newUser=new User({
      email:req.body.username,
      password:hash
    });
    newUser.save(function(err){
      if(err){
        console.log(err);
        //if we manage to save the user the render the Secrets page that is only avalaible to the registered users
      }else{
        res.render("secrets")
      }
    })
  });
  //Create a new user

  //Try to save the user in the DB
});

//Render login page
app.post("/login",function(req,res){
  //get the user credentials from the form
  const username=req.body.username;
  const password=md5(req.body.password);

  //search the DB to find the username of the given user
  User.findOne({email:username},function(err,foundUser){
    if(err){
      console.log(err)
    }
    else{
      //if we find the username in our DB then we check if the password that has been given is correct
      if(foundUser){
        bcrypt.compare(password,foundUser.password,function(err,result){
          if(result===true){
            //and if it matches then render the secrets page cause the user has logged in
            res.render("secrets");
          }
        });

      }
    }
  })
});

app.listen(3000,function(){
  console.log("Server is running at port 3000");
})
