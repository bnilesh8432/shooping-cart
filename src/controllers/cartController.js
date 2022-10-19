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


        if (!validator.isValidObjectId(userId)) return res.status(400).send({ status: false, message: "userId is invalid" })

        if (!productId) return res.status(400).send({ status: false, message: "Enter productId for the product to be added to cart." }) 
        if (!validator.isValidObjectId(productId)) return res.status(400).send({ status: false, message: "productId is invalid" })

        const product = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!product)return res.status(404).send({ status: false, message: "Product not found" })
  
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

  //==========================================================================================================================================

  const getCart = async function (req, res) {
    try {
      let reqUserId = req.params.userId;
      if (!reqUserId) {
        return res
          .status(400)
          .send({ status: false, message: "userId is required path params " });
      }
      if (!mongoose.Types.ObjectId.isValid(reqUserId)) {
        return res
          .status(400)
          .send({ status: false, message: "User id is invalid!" });
      }
  
      let isValid = await userModel.findOne({ _id: reqUserId });
      if (!isValid) {
        return res.status(404).send({
          status: false,
          message: "No User with this given userId. please give a valid user id",
        });
      }
      //Authentication
      // if (req.pass.userId !== reqUserId) {
      //     return res.status(403).send({ status: false, msg: "you are not authorised !!" })
      //   }
  
      const cart = await cartModel
        .findOne({ userId: isValid._id })
        .select({
          userId: 1,
          items: 1,
          totalPrice: 1,
          totalItems: 1,
          createdAt: 1,
          updatedAt: 1,
        });
      if (!cart) {
        return res.status(404).send({ status: false, message: "Empty Cart." });
      }
  
      let { items, userId, totalPrice, totalItems } = cart;
  
      let productId = items.forEach(function (obj) {
        return obj.productId;
      });
      let item = await productModel
        .find(productId)
        .select({ title: 1, description: 1, price: 1, productImage: 1 });
       //console.log(item)
  
      let finalData = {
        userId: userId,
        items: item,
        totalPrice: totalPrice,
        totalItems: totalItems,
      };
  
      return res.status(200).send({ status: true, message : "Success" ,data: finalData });
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

    if (!cartId) {
      return res.status(400).send({ status: false, message: "cartId is mandatory" })
    }
    if (!mongoose.isValidObjectId(cartId))
      return res.status(400).send({ status: false, message: "Invalid cartId" })

    cartDeatil = await cartModel.findOne({ _id: cartId, userId: UserId })
    if (!cartDeatil)
      return res.status(404).send({ status: false, message: "No cart found with provided cart Id" })
      if (!productId) {
        return res.status(400).send({ status: false, message: "PRODUCT ID IS mandatory" })
      }

    if (!mongoose.isValidObjectId(productId))
      return res.status(400).send({ status: false, message: "Invalid productId" })

    let ProductDeatil = await productModel.findOne({ _id: productId, isDeleted: false })
    if (!ProductDeatil)
      return res.status(404).send({ status: false, message: "No product found with provided product Id", })
      if (!removeProduct) {
        return res.status(400).send({ status: false, message: "REMOVE PRODUCT IS A MANDATORY FIELD" })
      }

    let index = cartDeatil.items.findIndex((element) => element.productId.toString() == productId)

    if (index == -1)
      return res.status(400).send({ status: false, message: "No product available in cart corresponding to provided productId" })

    if (!(removeProduct == 0 || removeProduct == 1))
      return res.status(400).send({ status: false, message: "removeProduct can contain only 0 or 1" })

    let quantity = cartDeatil.items[index].quantity;
    if (removeProduct == 0) {
      cartDeatil.items.splice(index, 1)
      cartDeatil.totalItems -= 1;
      cartDeatil.totalPrice -= quantity * ProductDeatil.price;
    }
    else {
      if (quantity == 1){
        cartDeatil.items.splice(index, 1)
        cartDeatil.totalItems -= 1;}
      else
        cartDeatil.items[index].quantity -= 1

      
      cartDeatil.totalPrice -= ProductDeatil.price;
    }

    await cartDeatil.save()

    res.status(200).send({ status: true, message: "Updated Successfully", data: cartDeatil })
  }

  catch (err) {
    res.status(200).send({ status: true, message: err.message })
  }
}



//================================================================================================================================================

const deleteByUserId = async (req, res) => {
  try {
let userId = req.params.userId
if(!validator.isValidObjectId(userId)){
return res.status(400).send({status: false, message: "provide valid userId"})}

let userExist = await userModel.findById(userId);
if (!userExist)
 {
return res.status(404).send({ status: false, message: "No User Found With this Id" });
}

let findCart = await cartModel.findOne({userId: userId})
if(findCart.items.length == 0)
{
return res.status(400).send({status: false, message: "cart is already empty"})
}
await cartModel.updateOne({_id: findCart._id},{items: [], totalPrice: 0, totalItems: 0})

return res.status(204).send({status: false, message: "deleted successfully"})
}   
  catch (err){
  return res.status(500).send({status: false, message: err.message}) }
}

module.exports = {updateCart, deleteByUserId,createCart,getCart}



