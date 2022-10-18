const mongoose = require("mongoose");


//request body validation 
const isValidRequestBody = function (reqbody) {
    if (!Object.keys(reqbody).length) {
        return false;
    }
    return true;
    // const isValidRequestBody = function (reqbody) {
    //     if(Object.keys(reqbody).length==0) 
    //         return false;
};

//objectId body validation 
const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId);
};

// checking validation for undefined, null and string
const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true;
}

// email validation
const isValidEmail = function (email) {
    const pattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return pattern.test(email); // returns a boolean
};

// pinCode validation
const isvalidPincode = function(pincode){
    if(!/^[1-9][0-9]{5}$/.test(pincode)){
        return false
    }
    return true
}

// password validation
const isValidPassword = function (password) {
    if (password.length >= 8 && password.length <= 15) {
        return true;
    }
    return false;
};

// phone validation
const isValidPhone = function (phone) {
    if (! /^[6-9]\d{9}$/.test(phone)){
        return false
    }
    return true
}

const isValidEnum  = (availableSizes)=>{
    let enums = ["S", "XS", "M", "X", "L", "XXL", "XL"]
    availableSizes = [...new Set(availableSizes)]
    availableSizes = availableSizes.map(ele => {return ele.toUpperCase()})

    let checkEnum = availableSizes.filter(ele => enums.includes(ele))

    if( checkEnum.length == availableSizes.length) {return true}
    return false
}
const isEmptyString = (value) => {
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true
};
const isValidPrice = (price) => {
    if (/[(0-9)+.?(0-9)*]+/igm)
        return true
    return false
}
module.exports = { isValidRequestBody, isValidEmail, isValid, isvalidPincode, isValidPassword, isValidPhone, 
    isValidObjectId, isValidEnum,isEmptyString,isValidPrice}