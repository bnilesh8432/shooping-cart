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

module.export = {deleteByUserId}