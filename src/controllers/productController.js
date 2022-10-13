const productModel = require('../models/productModel');
const uploadFile = require("../aws/aws")

const {isValid, isValidRequestBody, isValidEnum } = require('../validator/validator')

const createProduct = async (req, res)=>
{
    try{
        const files = req.files

        const data = req.body

        const {title, description, price, isFreeShipping, productImage, style,availableSizes, installments} = data

    if(!isValid(title)) {return res.status(400).send({status:false, message: "title required"})}

    if(!isValid(description)) {return res.status(400).send({status:false, message: "description required"})}

    if(!isValid(price)) {return res.status(400).send({status:false, message: "price required"})}

    //  if(!isValid(currencyId)) {return res.status(400).send({status:false, message: "currencyId required"})}

    //    if(!isValid(currencyFormat)) {return res.status(400).send({status:false, message: "currencyFormat required"})}

    if(!isValid(isFreeShipping)) {return res.status(400).send({status:false, message: "isFreeShipping required"})}

  //  if(!isValid(productImage)) {return res.status(400).send({status:false, message: "productImage required"})}

    if(!isValid(style)) {return res.status(400).send({status:false, message: "style required"})}

    if(!isValid(availableSizes)) {return res.status(400).send({status:false, message: "availableSizes required"})}

    if(!isValid(installments)) {return res.status(400).send({status:false, message: "installments required"})}

    // if(!productImage) {return res.status(400).send({status:false, message: "productImage is required"})}

    data.currencyFormat = "₹"
    data.currencyId = "INR"

    if(!isValidRequestBody(data)) {return res.status(400).send({ status: false, Message: "Invalid request parameters, Please provide product details" })}

    if(files.length > 0) {data.productImage = await uploadFile(files[0]);
    } 
        else 
    {
        return res.status(400).send({ status: false, message: "ProductImage  is required" });
    }

    const uniqueTitle = await productModel.findOne({title:title})
    
    if(uniqueTitle){return res.status(400).send({status:false, message: "title must be unique"})}

    if (isValidEnum(availableSizes))
      return res.status(400).send({ status: false, msg: "availableSizes should be of (S,XS,M,X,L,XXL,XL)" });

    const saveData = await productModel.create(data)

    res.status(201).send({ status: true, message: 'product created successfully', data: saveData })

    } 

    catch (err) 
    {
        return res.status(500).send({ status: false, message: err.message });
    }
}
 module.exports = {createProduct}















































































































































































































































































































































































































































 const getProductById = async (req, res) => {
    try {
        let Id = req.body.productId
        if(!validator.isValidObjectId(Id)){
            return res.status(400).send({status: false, message: "Please enter valid productId"})
        }
        let isValidproductId = await productModel.findById({_id: Id})
        if(!isValidproductId){
            return res.status(404).send({status: false, message: "ProductId is not found"})
        }
        if(isValidproductId.isDeleted == true){
            return res.status(404).send({status: false, message: "product is already deleted"})
        }
        let allProducts = await productModel.findOne({_id: Id, isDeleted: false}).select({deletedAt: 0})
            return res.status(200).send({status: true, message: "Success", data: allProducts})
        }

    catch (err){
        return res.status(500).send({status: false, message: err.message})
    }
}






























 let deleteByIDProduct = async (req, res) => 
 {
    try {
        const productId = req.params.productId;

        if (!mongoose.Types.ObjectId.isValid(productId)) 
        
        {
            return res.status(400).send({ status: false, message: "NOT A VALID ID" })
        }


        const product = await productModel.findOne({ _id: productId, isDeleted: false, deletedAt: null });

        if (!product)
        
        {
            return res.status(404).send({ status: false, message: "NO PRODUCT FOUND" });
        }

        const DELETE = await productModel.findByIdAndUpdate(productId, { $set: { isDeleted: true, deletedAt: Date.now() } });

        res.status(200).send({ status: true, message: `PRODUCT WITH ID ${productId} DELETED` });

        }
        catch (error) 
        {

        res.status(500).send({ status: false, message: error.message });
    }
}


module.exports={deleteByIDProduct, getProductById}