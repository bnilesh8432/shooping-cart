const mongoose = require("mongoose");

//request body validation 
const isValidRequestBody = function (reqbody) {
    if (!Object.keys(reqbody).length) {
        return false;
    }
    return true;
};

//objectId body validation 
const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId);
};

// checking validation for undefined, null and string
const isValid = function (value) {
    if (typeof value === "undefined" ) return false;
    if (typeof value === "string" && value.trim().length == 0) return false;
    if (typeof value === "string") return true;
};

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
    if( /^[6-9]\d{}$/.test(phone)){
        return false
    }
    return true
}

// image validation
const isValidImg = (img) => {
    if(! /image\/png|image\/jpeg|image\/jpg/.test(img)){
        return false
    }
    return true
}


module.exports = { isValidRequestBody, isValidEmail, isValid, isvalidPincode, isValidPassword, isValidPhone, isValidObjectId, isValidImg }