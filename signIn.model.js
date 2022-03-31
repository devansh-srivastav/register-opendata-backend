const mongoose = require('mongoose');
const adminlogin= mongoose.Schema({
    
    username:{
        type:String,
    },
    password:{
        type:String 
    }


},
    {collection: "adminlogin"}
)

const adminModel = mongoose.model("adminlogin", adminlogin);

module.exports = adminModel;









