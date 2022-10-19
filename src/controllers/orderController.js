let cartModel = require('../models/cartModel')
const orderModel = require('../models/orderModel')
const userModel = require('../models/userModel')
const validator = require('../validator/validator')



let createOrder = async (req, res) => {
    try {
        let userId = req.params.userId
        let { status, cancellable } = req.body

        let cart = await cartModel.findOne({ userId: userId })
        if (!cart)
            return res.status(400).send({ status: false, message: "EMPTY CART" })
        if (cart.items.length == 0) {
            return res.status(400).send({ status: false, message: "EMPTY CART" })
        }
        if (status || status === "") {
            if (!validator.isValid(status)) {
                return res.status(400).send({ status: false, message: "NOT VALID STATUS" })
            } if (status == "pending" || status == "completed" || status == "cancelled") {
                status = status
            } else return res.status(400).send({ status: false, message: "STATUS ONLY BE pending completed cancelled" })
        }
        if (cancellable || cancellable === "") {
            if (cancellable == "true" || cancellable == "false") {
                cancellable = cancellable
            } else return res.status(400).send({ status: false, message: "CANCELLABLE CAN ONLY BE THE TRUE AND FALSE" })
        }

        let totalQuantitys = 0
        for (let i = 0; i < cart.items.length; i++) {
            totalQuantitys += cart.items[i].quantity
        }
        let order = {
            userId: userId,
            items: cart.items, totalPrice: cart.totalPrice,
            totalItems: cart.totalItems,
            totalQuantity: totalQuantitys,
            status: status,
            cancellable: cancellable
        }

        let emptyCart = { 
            items: [], 
            totalPrice: 0, 
            totalItems: 0 }

        let result = await orderModel.create(order)
        let updateCart = await cartModel.findOneAndUpdate({userId},emptyCart)

        res.status(201).send({ status: true, message: "Success", data: result })
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

const updateOrder = async (req,res)=>{
    try{

        let userId = req.params.userId;
        let body = req.body;
        let {orderId,status} = body
        let updateOrder ={}

        if(!validator.isValidRequestBody(body)){
            return res.status(400).send({status : false , message : "plz give data in JSON .."})
        }
        
        if(!validator.isValidObjectId(userId)){
            return res.status(400).send({status : false , message : "invalid userId .."})
        }
        let user = await userModel.findById(userId)
        if(!user){
            return res.status(404).send({status : false , message : "user not found..."})
        }

        if(!validator.isValid(orderId)){
            return res.status(400).send({status : false , message : "orderId required .."})
        }
        if(!validator.isValidObjectId(orderId)){
            return res.status(400).send({status : false , message : "invalid orderId .."})
        }
        let order = await orderModel.findOne({_id :orderId ,userId})
        if(!order){
            return res.status(404).send({status : false , message : "order not found..."})
        }

        if(!validator.isValid(status)){
            return res.status(400).send({status : false , message : "status required .."})
        }
        if(status){
            let statusEnum =  ["pending", "completed", "canceled"]
            if(!statusEnum.includes(status)){
                return res.status(400).send({status : false , message : "status should be only (pending, completed, canceled) "})
            }
            if(order.cancellable == false && status == "canceled"){
                return res.status(400).send({status : false , message : "this order is not cancelleble .."})
            }
            updateOrder['status'] = status

        }

        let update = await orderModel.findByIdAndUpdate(orderId,updateOrder,{new:true})


        return res.status(200).send({status : true , message :"Success" , data : update})
    }
    catch(err){
        return res.status(500).send({status : false , message :err.message})
    }
}

module.exports = { createOrder,updateOrder }