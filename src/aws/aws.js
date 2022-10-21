const aws = require('aws-sdk')

aws.config.update({
    accessKeyId: "AKIAY3L35MCRZNIRGT6N",
    secretAccessKey: "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",
    region: "ap-south-1"
})

let uploadFile = async(file) => {
    return new Promise(function(resolve, reject) {        /// single sstage   call back hell ko handle kkrne k leye promise ise krte hai
        // Create S3 service object
        let s3 = new aws.S3({ apiVersion: "2006-03-01" });
        var uploadParams = {
            ACL: "public-read",                    // share with which which person like only me and everyone
            Bucket: "classroom-training-bucket",  /// create user
            Key: "group45/" + file.originalname,    // this is bucket key 
            Body: file.buffer                       // make small data and puhsing into aws 
        };
        // Callback - function provided as the second parameter ( most oftenly)
        s3.upload(uploadParams, function(err, data) {    // using aws s3 
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


//event loop set time like excute afte 2mins and hold 2mins excute
 