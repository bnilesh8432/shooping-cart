const cartModel = require('../models/cartModel')
const mongoose = require('mongoose')



const createCart = async function (req, res) {
    try {
        let userId = req.params.userId
        let { productId } = req.body
        if (!productId)
            return res.status(400).send({ status: false, message: "Enter productId for the product to be added to cart." })
  
      //   if (!validator.isValidObjectId(productId))
      //       return res.status(400).send({ status: false, message: "productId is invalid" })
  
        if (!mongoose.Types.ObjectId.isValid(productId)) {
          return res.status(400).send({
              status: false,
              message: "NOT A VALID ID"
          })
      }
      let 
        const product = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!product)
            return res.status(404).send({ status: false, message: "Product not found" })
  
        let cart = await cartModel.findOne({ userId })
        if (!cart) {
            let newCart = await cartModel.create(
                {
                    userId: userId,
                    items: [{
                        productId: productId,
                        quantity: 1
                    }],
                    totalPrice: product.price,
                    totalItems: 1
                }
            )
            return res.status(201).send({ status: true, message: "Success", data: newCart })
        }
        let indexOfProduct = -1
        for (let i in cart.items) {
            if (cart.items[i].productId == productId) {
                indexOfProduct = i
                break
            }
        }
        if (indexOfProduct == -1) {
            cart = await cartModel.findOneAndUpdate(
                { userId },
                {
                    $addToSet: { items: { productId: productId, quantity: 1 } },
                    $inc: { totalPrice: product.price, totalItems: 1 }
                },
                { new: true }
            )
        }
        else {
            ++cart.items[indexOfProduct].quantity
            cart.totalPrice += product.price
            await cart.save()
        }
        return res.status(201).send({ status: true, message: "Success", data: cart })
  
    } 
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
  }


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

        
module.export = {updateCart, deleteByUserId,createCart}