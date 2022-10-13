const express = require('express')
const router = express.Router()
const register = require("../controllers/userController")
const auth= require("../middleware/midd")
const {createProduct, getProductById} = require('../controllers/productController')

router.post('/register',register.createUser)
router.post('/login',register.userLogin)
router.put('/user/:userId/profile',auth.Authentication,auth.Authorization,register.updateProfile)

router.get('/user/:userId/profile',auth.Authentication,register.getUser)

//===============Product-API==================//
 router.post('/products', createProduct )
 router.get('/products/:productId', getProductById)




























module.exports = router;

router.all('/*',async function(req,res){
    return res.status(404).send({status:false,message:"Page Not Found"})
})