const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    password:{
        type:String,
        default:""
    },
    mobile:{
        type:String,
        default:""
    },
    email:{
        type:String,
        required:true
    },
    is_admin:{
        type:Number,
        default:0
    },
    is_verified:{
        type:Boolean,
        default:false
    },
    is_block:{
        type:Boolean,
        default:false
    },
    googleId:{
        type:String
    },
    token:{
        type:String,
        default:''
    },
    referedBy:{
        type:String,
        default:''
    },
    referalCode:{
        type:String,
    },
    wallet:{
        type:Number,
        default:0
    },
    coupon:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Coupon"
        
    }]
});

const collection = mongoose.model('User',userSchema)
module.exports = collection