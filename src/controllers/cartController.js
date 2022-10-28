const cartModel = require('../models/cartModel')
const productModel = require('../models/productModel')
const userModel = require('../models/userModel')
const validator = require('../validator/validator')
const mongoose = require('mongoose')

//==============================================================================================================================================================

const createCart = async function (req, res) {
  try {
    let userId = req.params.userId
    let { productId } = req.body

    if (!validator.isValidRequestBody(req.body)) {
      return res.status(400).send({ status: false, message: "plz enter data to create cart .." })
    }
    if (!validator.isValid(productId)) {
      return res.status(400).send({ status: false, message: "Enter productId for the product to be added to cart." })
    }

    if (!validator.isValidObjectId(productId)) {
      return res.status(400).send({ status: false, message: "productId is invalid" })
    }
    const product = await productModel.findOne({ _id: productId, isDeleted: false })
    if (!product) {
      return res.status(404).send({ status: false, message: "Product not found" })
    }

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
    let indexOfProduct = -1                                  // product no exist then value -1
    for (let i in cart.items) {                                   // find the product in cart item
      if (cart.items[i].productId == productId) {                 // [i] update when find 
        indexOfProduct = i                                        // give i 
        break
      }
    }
    if (indexOfProduct == -1) {                                      // compaire line 44 with this when find the same then update
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
      ++cart.items[indexOfProduct].quantity                           // when find a prodcut then update
      cart.totalPrice += product.price
      await cart.save()
    }
    return res.status(201).send({ status: true, message: "Success", data: cart })

  }
  catch (err) {
    return res.status(500).send({ status: false, message: err.message })
  }
}

//==========================================================================================================================================

const getCart = async function (req, res) {
  try {
    let reqUserId = req.params.userId;

    if (!validator.isValidObjectId(reqUserId)) {
      return res.status(400).send({ status: false, message: "User id is invalid!" });
    }

    let user = await userModel.findById(reqUserId);
    if (!user) {
      return res.status(404).send({ status: false, message: "User not found with this userId", });
    }

    const cart = await cartModel.findOne({ userId: user._id }).populate({ path: 'items', populate: "productId", select: "title" });
    if (!cart) {
      return res.status(404).send({ status: false, message: "Cart Not found with this cart id" });
    }

    return res.status(200).send({ status: true, message: "Success", data: cart });
  } catch (err) {
    return res.status(500).send({ status: false, Error: err.message });
  }
};



//====================put cart-api=================================================================================

const updateCart = async (req, res) => {
  try {
    let UserId = req.params.userId;
    let { productId, cartId, removeProduct } = req.body;
    //let cartDeatil;

    if (!validator.isValidRequestBody(req.body)) {
      return res.status(400).send({ status: false, message: "plz provide data in JSON" })
    }

    if (!validator.isValid(cartId)) {
      return res.status(400).send({ status: false, message: "cartId is mandatory" })
    }
    if (!validator.isValidObjectId(cartId)) {
      return res.status(400).send({ status: false, message: "Invalid cartId" })
    }

    cartDeatil = await cartModel.findOne({ _id: cartId, userId: UserId })
    if (!cartDeatil) {
      return res.status(404).send({ status: false, message: "No cart found with provided cart Id" })
    }

    if (!validator.isValid(productId)) {
      return res.status(400).send({ status: false, message: "PRODUCT ID IS mandatory" })
    }
    if (!validator.isValidObjectId(productId)) {
      return res.status(400).send({ status: false, message: "Invalid productId" })
    }

    let ProductDeatil = await productModel.findOne({ _id: productId, isDeleted: false })
    if (!ProductDeatil) {
      return res.status(404).send({ status: false, message: "No product found with provided product Id", })
    }

    if (!validator.isValid(removeProduct)) {
      return res.status(400).send({ status: false, message: "removeProduct is required..." })
    }
    if (!(removeProduct == 0 || removeProduct == 1)) {
      return res.status(400).send({ status: false, message: "removeProduct can contain only 0 or 1" })
    }

    let index = cartDeatil.items.findIndex((element) => element.productId.toString() == productId)
    if (index == -1) {
      return res.status(400).send({ status: false, message: "Cart is already empty .." })
    }

    let quantity = cartDeatil.items[index].quantity;
    if (removeProduct == 0) {                                       // recied by body prodvut 0 then remove 
      cartDeatil.items.splice(index, 1)    /// remove
      cartDeatil.totalItems -= 1;                          
      cartDeatil.totalPrice -= quantity * ProductDeatil.price;
    }
    else {
      if (quantity == 1) {  // allready one then remove 
        cartDeatil.items.splice(index, 1)   /// remove 
        cartDeatil.totalItems -= 1;
        cartDeatil.totalPrice -= ProductDeatil.price;
      }
      else {
        cartDeatil.items[index].quantity -= 1;
        cartDeatil.totalPrice -= ProductDeatil.price;
      }
    }

    await cartDeatil.save();

    return res.status(200).send({ status: true, message: "Success", data: cartDeatil })
  }
  catch (err) {
    return res.status(200).send({ status: false, message: err.message })
  }
}



//================================================================================================================================================

const deleteByUserId = async (req, res) => {
  try {
    let userId = req.params.userId

    let findCart = await cartModel.findOne({ userId: userId })
    if (findCart.items.length == 0) {
      return res.status(400).send({ status: false, message: "cart is already empty" })
    }
    await cartModel.updateOne({ _id: findCart._id }, { items: [], totalPrice: 0, totalItems: 0 })

    return res.status(204).send({ status: false, message: "deleted successfully" })
  }
  catch (err) {
    return res.status(500).send({ status: false, message: err.message })
  }
}

module.exports = { updateCart, deleteByUserId, createCart, getCart }



