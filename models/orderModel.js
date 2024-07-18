
const mongoose=require('mongoose')

const orderSchema = new mongoose.Schema({

    orderId: {
        type: String,
        default: () => {
          return Math.floor(100000 + Math.random() * 900000).toString();
        },
        unique: true,
      },

    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    cartId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Cart',
        // required:true
    },
    products:[{
        productId:{
            type: mongoose.Schema.Types.ObjectId,
            ref:'products',
            required:true
        },
        size:{
            type: String,
            required:true
        },
        quantity:{
            type:Number,
            required:true,
            default:1
    },
        price:{
            type:Number,
            required:true
    }

  }],

    totalAmount: {
        type:Number,
        required:true
        
        
    },
   
    orderStatus:
    {
        type: String,
        enum: ['Pending', 'Delivered', 'Cancelled',"Return","Shipped","Return pending","Return cancelled","Return completed","Payment failed"], // Define possible payment statuses
        default: 'Pending'
  

    },
    payment_method: {
        method: {
            type: String,
            enum: ['COD', 'Wallet', 'RazorPay'],
        
            required: true
        }
    },
    payment_status: {
       
            type: String,
            enum: ['Failed', 'Success'],
            default:'Failed'
        
    },
    
    
    date:{
        
        type:Date,
      default:Date.now()
    
      
    },
    
    
    delivery:{
        type:Number,
        default:0
    },
  addressId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Address',
        required:true
  }



},
{
    timestamps:true
})


const collection = mongoose.model("Order",orderSchema)
module.exports= collection