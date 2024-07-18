const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    is_delete:{
        type:Boolean,
        default:false
    }

})

const collection = mongoose.model('Category',categorySchema)
module.exports = collection
