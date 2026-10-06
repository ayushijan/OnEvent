require("dotenv").config();

const express=require("express");
const app=express();

const session = require("express-session");

const passport= require("./config/passport");

const userRoutes=require("./routes/userRoutes");

const adminRoutes = require("./routes/adminRoutes");

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.set("view engine","ejs");

app.use(express.static("public"));

app.use("/uploads", express.static("uploads"));

app.use(session({
    secret: "onevent-secret",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());

app.use(passport.session());

app.use("/",userRoutes);

app.use("/", adminRoutes);

module.exports=app;