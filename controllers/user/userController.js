const service=require("../../services/user/userService");

const signup= async (req,res)=>{
    try{
    const result=await service(req.body);
    res.status(201).render("user/verifyOtp",{
        email: result.email
    });
    }catch(error){
        res.status(error.statusCode || 500).send(error.message)
    }
}


module.exports=signup;
