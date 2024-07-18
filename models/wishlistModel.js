const mongoose = require('mongoose')

const wishlistSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    products:[{
        productId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'products', 
            required:true
        }
    }]
})

const collection = mongoose.model('wishlist',wishlistSchema)
module.exports = collection;