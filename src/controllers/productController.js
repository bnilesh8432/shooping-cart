const productModel = require('../models/productModel');
const uploadFile = require("../aws/aws")
const mongoose = require('mongoose')
const validator = require('../validator/validator')

const createProduct = async (req, res) => {
    try {
        const files = req.files

        const data = req.body

        let { title, description, price, style, isFreeShipping, availableSizes, installments, currencyId, currencyFormat } = data

        if (!validator.isValidRequestBody(data) && typeof files == 'undefined') {
            return res.status(400).send({ status: false, Message: "Invalid request parameters, Please provide product details" })
        }

        if (!validator.isValid(title)) {
            return res.status(400).send({ status: false, message: "title required" })
        }
        const uniqueTitle = await productModel.findOne({ title: title })
        if (uniqueTitle) {
            return res.status(400).send({ status: false, message: "title must be unique" })
        }

        if (!validator.isValid(description)) {
            return res.status(400).send({ status: false, message: "description required" })
        }

        if (!validator.isValid(price)) {
            return res.status(400).send({ status: false, message: "price required" })
        }

        if (!validator.isValid(currencyId)) {
            return res.status(400).send({ status: false, message: "currencyId required" })
        }
        if (currencyId) {
            if (currencyId != "INR") {
                return res.status(400).send({ status: false, message: "currencyId should be only INR " })
            }
            data['currencyId'] = currencyId
        }

        if (!validator.isValid(currencyFormat)) {
            return res.status(400).send({ status: false, message: "currencyFormat required" })
        }
        if (currencyFormat) {
            if (currencyFormat != "₹") {
                return res.status(400).send({ status: false, message: "currencyFormat should be only ₹ " })
            }
            data['currencyFormat'] = currencyFormat
        }

        if (!validator.isEmptyString(isFreeShipping)) {
            return res.status(400).send({ status: false, message: "if you want to update isFreeShipping then put somthing in string ..." })
        }
        if (isFreeShipping) {
            isFreeShipping = isFreeShipping.trim()
            if (!["true", "false"].includes(isFreeShipping)) {
                return res.status(400).send({ status: false, message: "isFreeShipping should be only true or false" })
            }
            data['isFreeShipping'] = isFreeShipping
        }

        if (!validator.isValid(style)) {
            return res.status(400).send({ status: false, message: "style required" })
        }

        // if (!validator.isValid(availableSizes)) {
        //     return res.status(400).send({ status: false, message: "availableSizes required" })
        // }
        if (availableSizes) {
            
            availableSizes = JSON.parse(availableSizes)
            if (typeof availableSizes != "object") {
                return res.status(400).send({ status: false, message: "plz give availableSizes in array of string like-> ['X','L']" })
            }
            availableSizes = availableSizes.map(ele => ele.toUpperCase())
            if (!validator.isValidEnum(availableSizes)) {
                return res.status(400).send({ status: false, message: "availableSizes should be of (S,XS,M,X,L,XXL,XL)" })
            }
            data['availableSizes'] = availableSizes
        }

        if (!validator.isValid(installments)) {
            return res.status(400).send({ status: false, message: "installments required" })
        }

        if (files && files.length > 0) {
            productImage = await uploadFile(files[0]);
            data['productImage'] = productImage
        } else {
            return res.status(400).send({ status: false, message: "ProductImage  is required" });
        }

        const saveData = await productModel.create(data)

        return res.status(201).send({ status: true, message: 'Success', data: saveData })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}

const getProduct = async function (req, res) {
    try {
        const query = req.query
        const filters = {}
        const sort = {}
        let { size, name, price, priceSort } = query

        if (!validator.isEmptyString(size)) {
            return res.status(400).send({ status: false, message: "plz enter size.." })
        }
        if (size) {
            // if (typeof size != "object") {
            //     return res.status(400).send({ status: false, message: "plz give size in array of string like-> ['X','L']" })
            // }
            size = JSON.parse(size)
            size = size.map(ele => ele.toUpperCase())
            if (!validator.isValidEnum(size)) {
                return res.status(400).send({ status: false, message: "size should be of (S,XS,M,X,L,XXL,XL)" })
            }
            filters['availableSizes'] = { $all: size }
        }

        if (!validator.isEmptyString(name)) {
            return res.status(400).send({ status: false, message: "plz enter name.." })
        }
         if (name) {
        //     name = name.trim()
            // filters['title'] = name
        // }
        name = name.trim()
            const regexName = new RegExp(name, "i");
            filters['title'] = { $regex: regexName };
         }

        if (!validator.isEmptyString(price)) {
            return res.status(400).send({ status: false, message: "plz enter price.." })
        }
        if (price) {
            let j_price = JSON.parse(price)
            console.log(j_price)
            if (Object.keys(j_price).length == 0) {
                return res.status(400).send({ status: false, message: 'plz enter price fliter..' })
            }
            if (j_price.priceGreaterThan) {
                filters['price'] = { $gt: j_price.priceGreaterThan }
            }
            if (j_price.priceLessThan) {
                filters['price'] = { $lt: j_price.priceLessThan }
            }
            if (j_price.priceGreaterThan && j_price.priceLessThan) {
                filters['price'] = { $gt: j_price.priceGreaterThan, $lt: j_price.priceLessThan }
            }
            console.log(price)
            // price = JSON.parse(price)
        }


        if (priceSort) {
            if (!(priceSort == 1 || priceSort == -1)) {
                return res.status(400).send({ status: false, message: 'plz give correct value for sotring ex. for ascending:1 & descending :-1' })
            }
            sort['price'] = priceSort
        }
        console.log(filters)
        const products = await productModel.find(filters).sort(sort)

        return res.status(200).send({ status: true, message: 'Success', count: products.length, data: products })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

const getProductById = async (req, res) => {
    try {
        let Id = req.params.productId
        if (!validator.isValidObjectId(Id)) {
            return res.status(400).send({ status: false, message: "Please enter valid productId" })
        }
        let isValidproductId = await productModel.findById({
            _id: Id
        })
        if (!isValidproductId) {
            return res.status(404).send({ status: false, message: "ProductId is not found" })
        }
        if (isValidproductId.isDeleted == true) {
            return res.status(404).send({ status: false, message: "product is already deleted" })
        }
        let allProducts = await productModel.findOne({ _id: Id, isDeleted: false }).select({ deletedAt: 0 })
        return res.status(200).send({ status: true, message: "Success", data: allProducts })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

const updateProduct = async (req, res) => {
    try {
        let productId = req.params.productId
        if (!validator.isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "Invalid ProductId " })
        }

        let checkProduct = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!checkProduct) {
            return res.status(404).send({ status: false, message: "product not found" })
        }

        let productData = req.body
        let files = req.files
        let { title, description, price, isFreeShipping, style, availableSizes, currencyId, currencyFormat, installments } = productData
        let updateData = {}

        if (Object.keys(productData).length < 1 && typeof files == 'undefined') {
            return res.status(400).send({ status: false, message: "Plz enter atleast one fild to update" });
        }

        if (!validator.isEmptyString(title)) {
            return res.status(400).send({ status: false, message: "if you want to update title then put something in string ..." })
        }
        if (title) {
            let duplicateTitle = await productModel.findOne({ title: title })
            if (duplicateTitle) {
                return res.status(400).send({ status: false, message: "title is already present" })
            }
            updateData['title'] = title
        }

        if (!validator.isEmptyString(description)) {
            return res.status(400).send({ status: false, message: "if you want to update description then put something in string ..." })
        }
        if (description) {
            updateData['description'] = description
        }

        if (!validator.isEmptyString(price)) {
            return res.status(400).send({ status: false, message: "if you want to update price then put somthing in string ..." })
        }
        if (price) {
            if (!/^\d*[0-9]\d*$/.test(price)) {
                return res.status(400).send({ status: false, message: "price should be only numbers" })
            }
            updateData['price'] = price
        }

        if (!validator.isEmptyString(currencyId)) {
            return res.status(400).send({ status: false, message: "if you want to update currencyId then put somthing in string ..." })
        }
        if (currencyId) {
            if (currencyId != "INR") {
                return res.status(400).send({ status: false, message: "currencyId should be only INR " })
            }
            updateData['currencyId'] = currencyId
        }

        if (!validator.isEmptyString(currencyFormat)) {
            return res.status(400).send({ status: false, message: "if you want to update currencyFormat then put somthing in string ..." })
        }
        if (currencyFormat) {
            if (currencyFormat != "₹") {
                return res.status(400).send({ status: false, message: "currencyFormat should be only ₹ " })
            }
            updateData['currencyFormat'] = currencyFormat
        }

        if (!validator.isEmptyString(isFreeShipping)) {
            return res.status(400).send({ status: false, message: "if you want to update isFreeShipping then put somthing in string ..." })
        }
        if (isFreeShipping) {
            isFreeShipping = isFreeShipping.trim()
            if (!["true", "false"].includes(isFreeShipping)) {
                return res.status(400).send({ status: false, message: "isFreeShipping should be only true or false" })
            }
            updateData['isFreeShipping'] = isFreeShipping
        }

        if (!validator.isEmptyString(style)) {
            return res.status(400).send({ status: false, message: "if you want to update style then put somthing in string ..." })
        }
        if (style) {
            updateData['style'] = style
        }

        if (!validator.isEmptyString(installments)) {
            return res.status(400).send({ status: false, message: "if you want to update installments then put somthing in string ..." })
        }
        if (installments) {
            if (!/^\d*[0-9]\d*$/.test(installments)) {
                return res.status(400).send({ status: false, message: "installments should be only numbers" })
            }
            updateData['installments'] = installments
        }


        if (files && files.length > 0) {
            let productImage = await uploadFile(files[0]);
            updateData['productImage'] = productImage
        }

        if (!validator.isEmptyString(availableSizes)) return res.status(400).send({ status: false, message: "if you want to update availableSizes then put somthing in string ..." })
        if (availableSizes) {
            if (typeof availableSizes != "object") {
                return res.status(400).send({ status: false, message: "plz give availableSizes in array of string like-> ['X','L']" })
            }
            availableSizes = JSON.parse(availableSizes)
            availableSizes = availableSizes.map(ele => ele.toUpperCase())
            if (!validator.isValidEnum(availableSizes)) {
                return res.status(400).send({ status: false, message: "availableSizes should be of (S,XS,M,X,L,XXL,XL)" })
            }
        }

        console.log(updateData)
        let UpdateProductData = await productModel.findByIdAndUpdate(productId, { $set: updateData, $addToSet: { availableSizes } }, { new: true })

        return res.status(200).send({ status: true, message: "Update product details is successful", productData: UpdateProductData })

    } catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }
}


//==========================delete-api========================//

let deleteByIDProduct = async (req, res) => {
    try {
        const productId = req.params.productId;

        if (!validator.isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "NOT A VALID ID" })
        }

        const product = await productModel.findOne({ _id: productId, isDeleted: false, deletedAt: null });

        if (!product) {
            return res.status(404).send({ status: false, message: "NO PRODUCT FOUND" });
        }

        const DELETE = await productModel.findByIdAndUpdate(productId, { $set: { isDeleted: true, deletedAt: Date.now() } });

        return res.status(200).send({ status: true, message: `PRODUCT WITH ID ${productId} DELETED` });

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}


module.exports = {
    createProduct,
    deleteByIDProduct,
    getProductById,
    updateProduct,
    getProduct
}