const express = require('express')
const router = express.Router()
const {createUser,userLogin,updateProfile,getUser} = require("../controllers/userController")
const {Authentication,Authorization} = require("../middleware/midd")
const { createProduct, getProduct, getProductById,deleteByIDProduct } = require('../controllers/productController')

router.post('/register', createUser)
router.post('/login', userLogin)
router.put('/user/:userId/profile', Authentication, Authorization, updateProfile)
router.get('/user/:userId/profile', Authentication, getUser)

//===============Product-API==================//
router.post('/products', createProduct)
router.get('/products', getProduct)
router.get('/products/:productId', getProductById)
// router.put('/products/:productId', updateProfile)
router.delete('/products/:productId', deleteByIDProduct)

//===============If Path Not Found==================//
router.all('/*', async function (req, res) {
    return res.status(404).send({ status: false, message: "Page Not Found" })
})

module.exports = router;
