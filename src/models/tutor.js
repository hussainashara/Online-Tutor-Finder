const mongoose = require('mongoose');
const Register = require('./register');
const tutorSchema = new mongoose.Schema({
    // console.log("Schema Created");
    register : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Register",
      
    },
    username : {
        type:String,
        required : true,
        unique : true
    },
    firstname : {
        type : String,
        required : true
    },
    lastname : {
        type : String,  
        required : true      
    },
    gender : {
        type : String,
        required : true
    },
    phone : {
        type : Number,
        require : true
    },
    address1 : {
        type : String,
        required : true
    },
    address2 : {
        type : String,
        required : true
    },
    town : {
        type : String,
        required : true
    },
    pincode : {
        type : String,
        required : true
    },
    state : {
        type : String,
        required : true
    },
    country : {
        type : String,
        required : true
    },
    qualification : {
        type : String,
        required : true
     },
    subject :{
        type : String
    },
    fees :{
        type:Number
    },
    about :{
        type : String
    },
    searchlevel : {
        type : String
    },
    rating : {
        type : String
    },
    timings:String,
    feedbacks : {
        type : Array
    }
});

const Tutor = new mongoose.model("Tutor" , tutorSchema);
module.exports = Tutor;
