const express = require('express')
const router = express.Router()
const register = require("../controllers/userController")



router.post('/register',register.createUser)




























module.exports = router;

router.all('/*',async function(req,res){
    return res.status(404).send({status:false,message:"Page Not Found"})
})