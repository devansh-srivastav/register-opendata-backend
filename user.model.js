const mongoose = require('mongoose');

const Register = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    surname:{
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    org: {
        type: String,
        required: true,
    },
    org_title:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        require:true,
    },
    website: {
        type: String,
        required: true,
    },
    desc:{
        type:String,
        require:true,
    },
    position:{
        type:String,
        require:true,
    },
    comment:{
        type:String
    },
    timeStamp:{
        type:Date,
    },
    username:{
        type:String,
    },
    status:{
        type:Number
    }
},
    { collection: 'UserData' }
)




const model = mongoose.model("UserData", Register);
module.exports = model;