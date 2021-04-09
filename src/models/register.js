const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');
const registerSchema = new mongoose.Schema({
    // console.log("Schema Created");
    account : {
        type : String,
        required : true
    },
    username : {
        type : String,
        required : true,
        unique : true
    },
    email : {
        type : String,
        required : true,
        unique : true
    },
    password : {
        type : String,  
        required : true      
    }
});

const Register = new mongoose.model("Register" , registerSchema);
module.exports = Register;
