const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const route = require('./routers/router.js');
const mongoose = require('mongoose');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb+srv://functionup:K3OCHkFxsJsV53MA@cluster0.e4rwd2y.mongodb.net/group45-DB",
{
    useNewUrlParser: true
})
.then( () => console.log("MongoDb is connected"))
.catch ( err => console.log(err) );

app.use('/',route);

app.listen(process.env.PORT || 3000, (err)=> {
    console.log("Connected to PORT 3000")
});