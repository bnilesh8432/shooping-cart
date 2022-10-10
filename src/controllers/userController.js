const userModel = require('../models/userModel');
const validator = require('validator');
const { isvalidPincode, isValidRequestBody } = require('../validator/validator');


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