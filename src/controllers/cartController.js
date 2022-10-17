const cartModel = require('../models/cartModel')
const mongoose = require('mongoose')

const deleteByUserId = async (req, res) => {
    try {
let userId = req.params.userId
let findCart = await cartModel.findOne({userId: userId})
if(findCart.items.length == 0){
return res.status(400).send({status: false, message: "cart is already empty"})
}
await cartModel.updateOne({_id: findCart._id}),
{items: [], totalPrice: 0, totalitem: 0}
return res.status(204).send({status: false, message: "deleted successfully"})
}      
    catch (err){
        return res.status(500).send({status: false, message: err.message})
    }
}

//====================put cart-api==================================

const updateCart = async (req, res) => {
    try {
        const data = req.body;
        const userId = req.params.userId;
        const { cartId, productId} = data;

        if (!isValidRequestBody(data)) {
            return res.status(400).send({ status: false, message: "Please provide some data to update" })}

        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Invalid UserId" })}

        if (userId != req.userId) {
            return res.status(403).send({ status: false, message: "Unauthorized Access" });
        }

        let userExist = await userModel.findById(userId);
        if (!userExist) {
            return res.status(404).send({ status: false, message: "No User Found With this Id" })}

        if (!productId) {return res.status(400).send({ status: false, message: "Provide the ProductId" })}

        if (!isValidObjectId(productId)) {return res.status(400).send({ status: false, message: "Invalid ProductId"})}

        let product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).send({ status: false, message: `No Product Found With this ${productId}` });
        }
        if (!cartId) {
            return res.status(400).send({ status: false, message: "Provide the carrId" });
        }
        if (!isValidObjectId(cartId)) {
            return res.status(400).send({ status: false, message: "Invalid cartId" });
        }

        let cartExist = await cartModel.findById(cartId);

        if (cartExist) {
        if(cartExist.items.length == 0) {return res.status(400).send({ status: false, message: "your cart is Empty"})}
          }
        } catch (err) {
            return res.status(500).send({ status: false, message: err.message });
        }}
module.export = {updateCart, deleteByUserId}