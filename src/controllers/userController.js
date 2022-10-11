const userModel = require('../models/userModel');
const validator = require('../validator/validator')
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
const uploadFile = require("../aws/aws")


//========================================Create User==============================================================================================

const createUser = async function (req, res) {
    try {
        const files = req.files
        const data = req.body

        if (!validator.isValidRequestBody(data)) {
            return res.status(400).send({ status: false, Message: "Invalid request parameters, Please provide user details" })

        }
        let { fname, lname, email, phone, password, profileImage, address } = data

        if (files.length > 0) {
            data.profileImage = await uploadFile(files[0]); //uploading file to aws s3
        } else {
            return res
                .status(400)
                .send({ status: false, message: "ProfileImage File is required" });
        }

        if (!validator.isValidImg.profileImage || profileImage == "")
            return res.status(400).send({ status: false, Message: "ProfileImage field should have a image file" })

        if (!validator.isValid(fname)) {
            return res.status(400).send({ status: false, message: "Provide the First Name " });
        }
        if (!/^[a-zA-Z ]{2,30}$/.test(fname)) {
            return res.status(400).send({ status: false, message: "Enter valid  fname" });
        }

        if (!validator.isValid(lname)) {
            return res.status(400).send({ status: false, message: "Provide the last Name " });
        }
        if (!/^[a-zA-Z ]{2,30}$/.test(lname)) {
            return res.status(400).send({ status: false, message: "Enter valid  lname" });
        }

        if (!validator.isValid(phone)) {
            return res.status(400).send({ status: false, message: "phone is required " });
        }

        if (!validator.isValidPhone(phone)) {
            return res.status(400).send({ status: false, message: "phone should be a valid indian phone number" });

        }
        let PhoneCheck = await userModel.findOne({ phone: phone.trim() });
        if (PhoneCheck) {
            return res.status(400).send({ status: false, message: `This no ${phone} is already present` });
        }
        if (!validator.isValid(email)) {
            return res.status(400).send({ status: false, message: "Provide the EmailId " });
        }
        if (!validator.isValidEmail(email)) {
            return res.status(400).send({ status: false, message: "Provide the Valid EmailId " });
        }
        let checkmail = await userModel.findOne({ email: email });
        if (checkmail) {
            return res.status(400).send({ status: false, message: `${email} already exists` });
        }
        if (!validator.isValid(password)) {
            return res.status(400).send({ status: false, message: "Provide the Password " });
        }
        if (!validator.isValidPassword(password)) {
            return res.status(400).send({ status: false, message: "Password Length must be btwn 8-15 chars only" });
        }
        const saltRounds = 10;
        const encryptedPassword = await bcrypt.hash(password, saltRounds);
        data["password"] = encryptedPassword;

        if (address) {
            let objAddress = JSON.parse(address);   // convort to object key

            if (objAddress.shipping) {
                if (!validator.isValid(objAddress.shipping.street)) {
                    return res.status(400).send({ status: false, message: "Please provide street name in shipping address" });
                }
                if (!validator.isValid(objAddress.shipping.city))
                    return res.status(400).send({ status: false, message: "Please provide city name in shipping address", });

                if (!validator.isvalidPincode(objAddress.shipping.pincode))
                    return res.status(400).send({ status: false, message: "Please provide pincode in shipping address" });
            }
            else {
                res.status(400).send({ status: false, message: "Please provide shipping address and it should be present in object with all mandatory fields" });
            }

            if (objAddress.billing) {
                if (!validator.isValid(objAddress.billing.street))
                    return res.status(400).send({ status: false, message: "Please provide street name in billing address" });

                if (!validator.isValid(objAddress.billing.city))
                    return res.status(400).send({ status: false, message: "Please provide city name in billing address" });

                if (!validator.isvalidPincode(objAddress.billing.pincode))
                    return res.status(400).send({ status: false, message: "Please provide pincode in billing address" });
            }
            else {
                return res.status(400).send({ status: false, message: "Please provide billing address and it should be present in object with all mandatory fields" });
            }
            data["address"] = objAddress;
        }
        else {
            return res.status(400).send({ status: false, message: "Please Provide The Address" });
        }
        let createdUser = await userModel.create(data);
        return res.status(201).send({ status: true, message: "User Created Succefully", data: createdUser });

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}

//=================================================login========================================================================================

const userLogin = async (req, res)=>{
    try{
        const data =  req.body;
   const  {email, password} = data
   if(Object.keys(data).length == 0) return res.status(400).send({status:false, message:"please enter data in reqbody"})
   
   if(!email) return res.status(400).send({status:false, message:"email not present"})
   if(!password) return res.status(400).send({status:false, message:"password not present"})

//  if(!isValidEmail(email))return res.status(400).send({status:false, message:"email is not correct formate"})
//  if(!isValidPassword(password))return res.status(400).send({status:false, message:"password is not correct formate"})

 const User = await userModel.findOne({email:email})
 if(!User) return res.status(404).send({status:false, message: "user not found with this email id"})

 let isValidPass =await bcrypt.compare(password,User.password)

 if(!isValidPass) return res.status(404).send({status:false, message: "enter correct password..."})

 const payload = { userId: User._id, iat: Math.floor(Date.now() / 1000) , exp : Math.floor(Date.now() / 1000+60*60*24)};

   const token = jwt.sign(payload, "group45")
   return res.status(200).send({ status: true, message: "User login successfully",userId : User._id ,token: token });
} catch (err) {
  res.status(500).send({ status: false, message: err.message });
}};


//=============================================Get Api==================================================================================

const getUser = async function(req, res){
  try{
      let userId = req.params.userId

      const user = await userModel.findOne({_id: userId})
      return res.status(200).send({status: true, message: "User Profile Details", data: user})
  } catch(error){
      return res.status(500).send({status: false, message: error.Message})
  }
}
 
//=========================================Update Profile==========================================================================================

const updateProfile = async function (req, res) {
    try {
        const body = req.body;
        const userId = req.params.userId
        const file = req.files 

        if (Object.keys(body).length == 0 && typeof file == 'undefined') return res.status(400).send({ status: false, message: "plz enter atleast one field to update .." })

        const { fname, lname, email, phone, password, address } = body
        const data = {}
        if (fname) {
            if (!validator.isValid(fname)) return res.status(400).send({ status: false, message: "fname is required.." })
            if (!/^[a-zA-Z ]{2,30}$/.test(fname)) return res.status(400).send({ status: false, message: "Enter valid  fname" });
            
            data['fname'] = fname.trim()
        }
        if (lname) {
            if (!validator.isValid(lname)) return res.status(400).send({ status: false, message: "lname is required.." })
            if (!/^[a-zA-Z ]{2,30}$/.test(lname)) return res.status(400).send({ status: false, message: "Enter valid  lname" });
            data['lname'] = lname.trim()
        }
        if (email) {
            if (!validator.isValid(email)) return res.status(400).send({ status: false, message: "email is required.." })
            if (!validator.isValidEmail(email)) return res.status(400).send({ status: false, message: "plz enter valid email.." })
            data['email'] = email
        }
        if (phone) {
            if (!validator.isValid(phone)) return res.status(400).send({ status: false, message: "phone is required.." })
            if (!validator.isValidPhone(phone)) return res.status(400).send({ status: false, message: "plz enter valid email.." })
            data['phone'] = phone
        }
        if (password) {
            if (!validator.isValid(password)) return res.status(400).send({ status: false, message: "password is required.." })
            if (!validator.isValidPassword(password)) return res.status(400).send({ status: false, message: "Password Length must be btwn 8-15 chars only.." })
            const saltRounds = 10;
            const encryptedPassword = await bcrypt.hash(password, saltRounds);
            data['password'] = encryptedPassword
        }
        if (address) {
            let objAddress = JSON.parse(address);   // convort to object key

            if (objAddress.shipping) {
                if (!validator.isValid(objAddress.shipping.street)) return res.status(400).send({ status: false, message: "Please provide street name in shipping address" });

                if (!validator.isValid(objAddress.shipping.city)) return res.status(400).send({ status: false, message: "Please provide city name in shipping address", });

                if (!validator.isvalidPincode(objAddress.shipping.pincode)) return res.status(400).send({ status: false, message: "Please provide pincode in shipping address" });
            }
            else {
                return res.status(400).send({ status: false, message: "Please provide shipping address and it should be present in object with all mandatory fields" });
            }

            if (objAddress.billing) {
                if (!validator.isValid(objAddress.billing.street)) return res.status(400).send({ status: false, message: "Please provide street name in billing address" });

                if (!validator.isValid(objAddress.billing.city)) return res.status(400).send({ status: false, message: "Please provide city name in billing address" });

                if (!validator.isvalidPincode(objAddress.billing.pincode)) return res.status(400).send({ status: false, message: "Please provide pincode in billing address" });
            }
            else {
                return res.status(400).send({ status: false, message: "Please provide billing address and it should be present in object with all mandatory fields" });
            }
            data["address"] = objAddress;
        }


        if (file && file.length > 0) {
            let profileImage = await uploadFile(file[0]); //uploading file to aws s3
            data['profileImage'] = profileImage
        } 

        const savedProfie = await userModel.findByIdAndUpdate(userId, {$set : data}, { new: true })

        return res.status(200).send({ status: true, message: "profile updated succesfully", data: savedProfie })

    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

module.exports = { createUser, userLogin, getUser, updateProfile }
