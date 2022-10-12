const express = require('express')
const router = express.Router()
const register = require("../controllers/userController")
const auth= require("../middleware/midd")


router.post('/register',register.createUser)
router.post('/login',register.userLogin)
router.put('/user/:userId/profile',auth.Authentication,auth.Authorization,register.updateProfile)

router.get('/user/:userId/profile',auth.Authentication,register.getUser)

// router.get('/books/:bookId',auth.authentication,createbook.getBooksById)




























module.exports = router;

router.all('/*',async function(req,res){
    return res.status(404).send({status:false,message:"Page Not Found"})
})