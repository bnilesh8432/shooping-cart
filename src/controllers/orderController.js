let cartModel = require('../models/cartModel')
const orderModel = require('../models/orderModel')
const { isValid } = require('../validator/validator')



let createOrder = async (req,res)=>{
    try{
    let userId=req.params.userId
    let {status,cancellable}=req.body
   
 let cart = await cartModel.findOne({userId:userId})
 if(!cart)
 return res.status(400).send({status:false,message:"EMPTY CART"})
 if(cart.items.length==0){
    return res.status(400).send({status:false,message:"EMPTY CART"})
 }
 if(status||status===""){
    if(!isValid(status)){
        return res.status(400).send({status:false,message:"NOT VALID STATUS"})
    }if(status=="pending"||status=="completed"||status=="cancelled"){
        status=status
    }else return res.status(400).send({status:false,message:"STATUS ONLY BE pending completed cancelled"})
}
if(cancellable||cancellable===""){
    if(cancellable=="true"||cancellable=="false"){
        cancellable=cancellable
    }else return res.status(400).send({status:false,message:"CANCELLABLE CAN ONLY BE THE TRUE AND FALSE"})
}

let totalQuantitys = 0
for(let i=0;i<cart.items.length;i++){
    totalQuantitys += cart.items[i].quantity
}
let order = {
    userId:userId,
    items:cart.items,totalPrice:cart.totalPrice,
    totalItems:cart.totalItems,
    totalQuantity:totalQuantitys,
    status:status,
    cancellable:cancellable
}
 let result= await orderModel.create(order)
 res.status(201).send({status:true,message:"Success",data:result})
    }
    catch(error){
        return res.status(500).send({status: false,message: error.message})}
}

module.exports={createOrder}