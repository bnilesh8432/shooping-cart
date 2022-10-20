const express = require('express')
const router = express.Router()
const {createUser,userLogin,updateProfile,getUser} = require("../controllers/userController")
const {Authentication,Authorization} = require("../middleware/midd")
const { createProduct, getProduct, getProductById,updateProduct,deleteByIDProduct } = require('../controllers/productController')
const {updateCart, deleteByUserId,createCart,getCart} = require('../controllers/cartController')
const { createOrder,updateOrder } = require('../controllers/orderController')

router.post('/register', createUser)
router.post('/login', userLogin)
router.put('/user/:userId/profile', Authentication, Authorization, updateProfile)
router.get('/user/:userId/profile', Authentication, getUser)

//===============Product-API==================//
router.post('/products', createProduct)
router.get('/products', getProduct)
router.get('/products/:productId', getProductById)
 router.put('/products/:productId',updateProduct)
router.delete('/products/:productId', deleteByIDProduct)

// =================Cart-API=======================//
router.post("/users/:userId/cart",Authentication,Authorization,createCart)
router.get("/users/:userId/cart",Authentication,Authorization,getCart)
router.put("/users/:userId/cart",Authentication,Authorization,updateCart)
router.delete('/users/:userId/cart', Authentication,Authorization,deleteByUserId)
//==================================================================
router.post("/users/:userId/orders",Authentication,Authorization,createOrder)
router.put("/users/:userId/orders",Authentication,Authorization,updateOrder)

//===============If Path Not Found==================//
router.all('/*', async function (req, res) {
    return res.status(404).send({ status: false, message: "Page Not Found" })
})

module.exports = router;
