const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost:27017/TestDatabase",{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    useCreateIndex:true
}).then(()=>{
    console.log("Db connected....");
}).catch((e)=>{
    console.log(e);
});
