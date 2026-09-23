const app=require("./app");
require("./config/db")

app.get("/",(req,res)=>{
    res.send("Welcome Home")
})

app.listen(3000,()=>{
    console.log("Server is running on 3000")
})


