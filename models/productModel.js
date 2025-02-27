const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    promoPrice:{
        type:Number,
        required:true
    },
    sizes:[{
        size: { type:String, enum: ['XS', 'S', 'M', 'L', 'XL'], required:true},
        stock: { type:Number, required: true, default: 0}
    }],
    category:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    is_delete:{
        type:Boolean,
        default:false
    },
    
    arrivalDate:{
        type:Date,
        default:Date.now()
    },
    images:[{
        type:String
    }],
    orderCount:{
        type: Number,
        default:0
    }

})

const collection = mongoose.model('products',productSchema)
module.exports = collection