const productModel = require('../models/productModel');
const uploadFile = require("../aws/aws")

const validator = require('../validator/validator')

const createProduct = async (req, res) => {
    try {
        const files = req.files

        const data = req.body

        const { title, description, price, isFreeShipping, productImage, style, availableSizes, installments } = data

        if (!validator.isValid(title)) { return res.status(400).send({ status: false, message: "title required" }) }

        if (!validator.isValid(description)) { return res.status(400).send({ status: false, message: "description required" }) }

        if (!validator.isValid(price)) { return res.status(400).send({ status: false, message: "price required" }) }

        if (!validator.isValid(style)) { return res.status(400).send({ status: false, message: "style required" }) }

        if (!validator.isValid(availableSizes)) { return res.status(400).send({ status: false, message: "availableSizes required" }) }

        if (!validator.isValid(installments)) { return res.status(400).send({ status: false, message: "installments required" }) }

        data.currencyFormat = "₹"
        data.currencyId = "INR"

        if (!validator.isValidRequestBody(data)) { return res.status(400).send({ status: false, Message: "Invalid request parameters, Please provide product details" }) }

        if (files.length > 0) {
            data.productImage = await uploadFile(files[0]);
        }
        else {
            return res.status(400).send({ status: false, message: "ProductImage  is required" });
        }

        const uniqueTitle = await productModel.findOne({ title: title })

        if (uniqueTitle) { return res.status(400).send({ status: false, message: "title must be unique" }) }

        if (validator.isValidEnum(availableSizes))
            return res.status(400).send({ status: false, msg: "availableSizes should be of (S,XS,M,X,L,XXL,XL)" });

        const saveData = await productModel.create(data)

        res.status(201).send({ status: true, message: 'product created successfully', data: saveData })

    }

    catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}

const getProduct = async function (req, res) {
    try {
        const query = req.query
        const filters = {}
        const sort = {}
        let { size, name, price, priceSort } = query

        if (size) {
            size = size.trim()
            if (!validator.isValid(size)) return res.status(400).send({ status: false, message: 'plz enter size..' })
            let enumSize = ["S", "XS", "M", "X", "L", "XXL", "XL"]
            if (!enumSize.includes(size)) return res.status(400).send({ status: false, message: 'plz enter valid size like "S", "XS", "M", "X", "L", "XXL", "XL"' })
            filters['availableSizes'] = size
        }

        if (name) {
            name = name.trim()
            if (!validator.isValid(name)) return res.status(400).send({ status: false, message: 'plz enter name..' })
            const regexName = new RegExp(name, "i");
            filters['title'] = {$regex : regexName}
            console.log(filters['title'])

        }

        if (price) {
            let j_price = JSON.parse(price)
            console.log(j_price)
            if (Object.keys(j_price).length == 0) return res.status(400).send({ status: false, message: 'plz enter prize fliter..' })
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
            if (!(priceSort == 1 || priceSort == -1)) return res.status(400).send({ status: false, message: 'plz give correct value for sotring ex. for ascending:1 & descending :-1' })
            sort['price'] = priceSort
        }
        console.log(filters)
        const products = await productModel.find(filters).sort(sort)

        return res.status(200).send({ status: true, message: 'Success', count: products.length, data: products })
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

const getProductById = async (req, res) => {
    try {
        let Id = req.body.productId
        if (!validator.isValidObjectId(Id)) {
            return res.status(400).send({ status: false, message: "Please enter valid productId" })
        }
        let isValidproductId = await productModel.findById({ _id: Id })
        if (!isValidproductId) {
            return res.status(404).send({ status: false, message: "ProductId is not found" })
        }
        if (isValidproductId.isDeleted == true) {
            return res.status(404).send({ status: false, message: "product is already deleted" })
        }
        let allProducts = await productModel.findOne({ _id: Id, isDeleted: false }).select({ deletedAt: 0 })
        return res.status(200).send({ status: true, message: "Success", data: allProducts })
    }

    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}


let deleteByIDProduct = async (req, res) => {
    try {
        const productId = req.params.productId;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).send({ status: false, message: "NOT A VALID ID" })
        }


        const product = await productModel.findOne({ _id: productId, isDeleted: false, deletedAt: null });

        if (!product) {
            return res.status(404).send({ status: false, message: "NO PRODUCT FOUND" });
        }

        const DELETE = await productModel.findByIdAndUpdate(productId, { $set: { isDeleted: true, deletedAt: Date.now() } });

        res.status(200).send({ status: true, message: `PRODUCT WITH ID ${productId} DELETED` });

    }
    catch (error) {

        res.status(500).send({ status: false, message: error.message });
    }
}


module.exports = { createProduct, deleteByIDProduct, getProductById, getProduct }