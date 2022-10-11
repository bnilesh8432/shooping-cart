const userModel = require('../models/userModel');
const validator = require('validator');
const { isvalidPincode, isValidRequestBody, isValidEmail, isValidPassword } = require('../validator/validator');


const createUser = async function (req,res){
    try{
        const data = req.body
        let { fname, lname, email, phone, password, address, profileImage ,...other} = data

         if (!isValidRequestBody(req.body)) {
            res.status(400).send({ status: false, Message: "Invalid request parameters, Please provide user details" })
            return
        }
        if(isValidRequestBody(other))
        return res.status(400).send({status:false,message:"Any extra field is not allowed "})
        

    }
}
     const userLogin = async (req, res)=>{
    try{
        const data =  req.body;
   const  {email, password} = data
   if(Object.keys(data).length == 0) return res.status(400).send({status:false, message:"please enter data in reqbody"})
   
   if(!email) return res.status(400).send({status:false, message:"email not present"})
   if(!password) return res.status(400).send({status:false, message:"password not present"})

 if(!isValidEmail(email))return res.status(400).send({status:false, message:"email is not correct formate"})
 if(!isValidPassword(password))return res.status(400).send({status:false, message:"password is not correct formate"})

 const findUser = await userModel.findOne({email:email, password:password})
 if(!findUser) return res.send(404).send({status:false, message: "email or password is incorrect"})

 const payload = { userId: user._id, iat: Math.floor(Date.now() / 1000) };

   const token = jwt.sign(payload, "group45")
   return res.status(200).send({ status: true, message: "User login successfully", token: token, exp: payload.exp, });
} catch (err) {
  res.status(500).send({ status: false, message: err.message });
}};

module.exports = { createUser, userLogin };