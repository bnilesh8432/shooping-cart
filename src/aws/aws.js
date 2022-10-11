const aws = require('aws-sdk')



aws.config.update({
    accessKeyId: "AKIAY3L35MCRZNIRGT6N",
    secretAccessKey: "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",
    region: "ap-south-1"
})

// let uploadFile= async ( file, arr) =>{
//    return new Promise( function(resolve, reject) {
//     let s3= new aws.S3({apiVersion: '2006-03-01'}); // we will be using the s3 service of aws

//     var uploadParams= {
//         ACL: "public-read",
//         Bucket: "classroom-training-bucket",  //HERE
//         Key: "Group55/" + file.originalname, //HERE 
//         Body: file.buffer
//     }

//     s3.upload( uploadParams, function (err, data ){
//         if(err) {
//             return reject({"error": err})
//         }
//         console.log(data)
//         console.log("file uploaded succesfully")
//         arr.push(data.Location)
//         return resolve(data.Location)
//     })
//    })
// }

// module.exports={uploadFile}


let uploadFile = async(file) => {
    return new Promise(function(resolve, reject) {        /// single sstage
        // Create S3 service object
        let s3 = new aws.S3({ apiVersion: "2006-03-01" });
        var uploadParams = {
            ACL: "public-read",
            Bucket: "classroom-training-bucket",  
            Key: "group21/" + file.originalname,  
            Body: file.buffer
        };
        // Callback - function provided as the second parameter ( most oftenly)
        s3.upload(uploadParams, function(err, data) {
            if (err) {
                return reject({ "error": err });
            }
            // console.log(data)
            // console.log(`File uploaded successfully. ${data.Location}`);
            return resolve(data.Location);
        });
    });
};
module.exports =  uploadFile
