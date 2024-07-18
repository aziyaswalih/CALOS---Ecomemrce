const User = require('../models/userModel')
const Product = require('../models/productModel')
const Cart = require('../models/cartModel')
const Address = require('../models/addressModel')
const Order = require('../models/orderModel')
const Coupon = require('../models/couponModel')
const mongoose = require('mongoose')
require('dotenv').config()
// const Razorpay = require('razorpay')
// var { validatePaymentVerification, validateWebhookSignature } = require('../node_modules/razorpay/dist/utils/razorpay-utils');


// var instance = new Razorpay({
//     key_id: process.env.KEY,
//     key_secret: process.env.SECRET,
//   });

// const razorpay = async(req,res) => {
//     try{
//       console.log("razorpayil ethi");
//   var options = {
//     amount: req.body.amount,  // amount in the smallest currency unit
//     currency: "INR"
    
//   };
//   instance.orders.create(options, function(err, order) {
//     console.log(order);
//   });
// }
// catch (error){
//     console.log("error from checkout controller razorpay",error);
// }

// }

    
// const verifyPayment = async(req,res)=>{
//     try {
//       console.log("razorpay payment verify");
//         const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = payload.payment;
//         const generated_signature = hmac_sha256(order_id + "|" + razorpay_payment_id, process.env.SECRET);
//         const isVerified =validatePaymentVerification({"order_id": razorpay_order_id, "payment_id": razorpay_payment_id }, razorpay_signature, process.env.SECRET);

        
//     if (generated_signature == razorpay_signature && isVerified) {
//     // payment is successful
//   }
//     } catch (error) {
//         console.log("error from checkout controller verifyPayment",error);
//     }
// }

const Razorpay = require('razorpay');
const crypto = require('crypto');

var instance = new Razorpay({
    key_id: process.env.RAZOR_KEY,
    key_secret: process.env.RAZOR_SECRET,
});

const razorpay = async (req, res) => {
    try {
        console.log("razorpay controller called");
        const options = {
            amount: req.body.amount,  // amount in the smallest currency unit
            currency: "INR"
        };
        instance.orders.create(options, function (err, order) {
            if (err) {
                console.error("Error creating order:", err);
                return res.status(500).json({ error: "Error creating order" });
            }
            console.log(order);
            res.json(order);
        });
    } catch (error) {
        console.log("Error in razorpay controller:", error);
        res.status(500).json({ error: "Server error" });
    }
};

const verifyPayment = async (req, res) => {
    try {
        console.log("razorpay payment verification called");
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body.response;

        const generated_signature = crypto.createHmac('sha256', process.env.SECRET)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest('hex');

        const isVerified = generated_signature === razorpay_signature;

        if (isVerified) {
            // Payment is successful
            console.log("Payment verified successfully");
            res.json({ status: "success", orderId: razorpay_order_id });
        } else {
            console.log("Payment verification failed");
            // ith udayippa
            // res.json({ status: "success", orderId: razorpay_order_id });

            // =======
            res.status(400).json({ error: "Payment verification failed" });
        }
    } catch (error) {
        console.log("Error in verifyPayment controller:", error);
        res.status(500).json({ error: "Server error" });
    }
};




const loadCheckout = async(req,res) => {
    try {
        
        const id=req.session.user._id
        
        const userData = await Address.find({userId:id})
        
        const list= await Cart.findOne({userId:id}).populate('products.productId')
        const address = userData.map(user => user.address);
        const user = await User.findById(id)
        const coupons = await Coupon.find()

        console.log("cart ",list);
        res.render('checkout',{list:list,address,user,coupons})
    } catch (error) {
        console.log("error from cart controller checkout",error)
    }
}



const CashOnDelivery=async(req,res)=>{
    try {

        console.log("entering cash on delivery");
        const{address,cartId,Paymentmethod,user,amount}=req.body
        console.log("address,cart,paymentmehtod",address,cartId,Paymentmethod,user);
        console.log(req.body);

        // const addressData=await Address.findById(address)
        const cart=await Cart.findById(cartId).populate('products.productId')
        // const cart= await Cart.findOne({userId:id}).populate('products.productId')


        if(cart)
            {
                console.log("cart finded",cart);
            
// =======================
// Use for...of loop to iterate over products
for (const item of cart.products) {
  const product = item.productId; // Get the populated product document

  // Error handling: Skip if product is not found
  if (!product) {
    console.error("Product not found for item:", item);
    continue;
  }

  const size = item.size;
  const quantity = item.quantity;

  // Find the size object within the product's sizes array
  const sizeToUpdate = product.sizes.find(s => s.size === size); 

  // Error handling: Skip if size is not found
  if (!sizeToUpdate) {
    console.error("Size not found for product:", product, "size:", size);
    continue;
  }
  product.orderCount += quantity

  // Update the stock quantity for the specific size
  sizeToUpdate.stock -= quantity;
  await product.save(); // Save the updated product
}
// =======================
                const Orderdata= await Order.create({
                    userId:user,
                    products: cart.products.map(product => ({
                        productId: product.productId._id,
                        size: product.size,
                        quantity: product.quantity,
                        price: product.price,
                        })),
                        totalAmount:amount,
                        orderStatus:'Pending',
                        'payment_method.method':'COD',
                        payment_status:'Failed',
                        
                    
                    addressId:address                   
                })

                const saving = await Orderdata.save()
                if(saving){
                    const deleteCart= await Cart.findOne({userId:user})
                    deleteCart.products=[]
                    await deleteCart.save()
                    console.log("order saved ",Orderdata);
                    res.status(200).json({success:true})

                }
                else
                {
                    console.log("order not saved ");
                }
            }else
            {
                console.log('cart not founded ');
            }
        
        
        
    } catch (error) {
        
        console.log("eror from checkout controller CashOnDelivery",error);
    }
}

const RazorPay=async(req,res)=>{
  try {

      console.log("entering razorpay");
      const{address,cartId,Paymentmethod,user,amount}=req.body
      console.log("address,cart,paymentmehtod",address,cartId,Paymentmethod,user);
      console.log(req.body);

      // const addressData=await Address.findById(address)
      const cart=await Cart.findById(cartId).populate('products.productId')
      // const cart= await Cart.findOne({userId:id}).populate('products.productId')


      if(cart)
          {
              console.log("cart finded",cart);
          
// =======================
// Use for...of loop to iterate over products
for (const item of cart.products) {
  const product = item.productId; // Get the populated product document

  // Error handling: Skip if product is not found
  if (!product) {
    console.error("Product not found for item:", item);
    continue;
  }

  const size = item.size;
  const quantity = item.quantity;

  // Find the size object within the product's sizes array
  const sizeToUpdate = product.sizes.find(s => s.size === size); 

  // Error handling: Skip if size is not found
  if (!sizeToUpdate) {
    console.error("Size not found for product:", product, "size:", size);
    continue;
  }
  product.orderCount += quantity

  // Update the stock quantity for the specific size
  sizeToUpdate.stock -= quantity;
  await product.save(); // Save the updated product
}
// =======================
              const Orderdata= await Order.create({
                  userId:user,
                  products: cart.products.map(product => ({
                      productId: product.productId._id,
                      size: product.size,
                      quantity: product.quantity,
                      price: product.price,
                      })),
                      totalAmount:amount,
                      orderStatus:'Pending',
                      'payment_method.method':'RazorPay',
                      payment_status:'Success',
                      
                  
                  addressId:address                   
              })

              const saving = await Orderdata.save()
              if(saving){
                  const deleteCart= await Cart.findOne({userId:user})
                  deleteCart.products=[]
                  await deleteCart.save()
                  console.log("order saved ",Orderdata);
                  res.status(200).json({success:true})

              }
              else
              {
                  console.log("order not saved ");
              }
          }else
          {
              console.log('cart not founded ');
          }
      
      
      
  } catch (error) {
      
      console.log("error from checkout controller razorpay",error);
  }
}


const paymentFailure = async(req,res) => {
  try {

    console.log("entering razorpay");
    const{address,cartId,amount}=req.query
    console.log("address,cartId,amount",address,cartId,amount);

    const user = req.session.user._id
    

    // const addressData=await Address.findById(address)
    const cart = await Cart.findById(cartId).populate('products.productId')
    // const cart= await Cart.findOne({userId:id}).populate('products.productId')


    if(cart)
        {
            console.log("cart finded",cart);
        
// =======================
// Use for...of loop to iterate over products
for (const item of cart.products) {
const product = item.productId; // Get the populated product document

// Error handling: Skip if product is not found
if (!product) {
  console.error("Product not found for item:", item);
  continue;
}

const size = item.size;
const quantity = item.quantity;

// Find the size object within the product's sizes array
const sizeToUpdate = product.sizes.find(s => s.size === size); 

// Error handling: Skip if size is not found
if (!sizeToUpdate) {
  console.error("Size not found for product:", product, "size:", size);
  continue;
}
product.orderCount += quantity

// Update the stock quantity for the specific size
sizeToUpdate.stock -= quantity;
await product.save(); // Save the updated product
}
// =======================
            const Orderdata= await Order.create({
                userId:user,
                products: cart.products.map(product => ({
                    productId: product.productId._id,
                    size: product.size,
                    quantity: product.quantity,
                    price: product.price,
                    })),
                    cartId:cartId,
                    totalAmount:amount,
                    orderStatus:'Payment failed',
                    'payment_method.method':'RazorPay',
                    payment_status:'Failed',
                    
                
                addressId:address                   
            })

            const saving = await Orderdata.save()
            // if(saving){
            //     const deleteCart= await Cart.findOne({userId:user})
            //     deleteCart.products=[]
            //     await deleteCart.save()
            //     console.log("order saved ",Orderdata);
            //     res.status(200).json({success:true})

            // }
            // else
            // {
            //     console.log("order not saved ");
            // }

            if(saving)
              res.status(200).json({success:true,cartId:cartId})
             else
             res.status(200).json({success:false})
        }else
        {
            console.log('cart not founded ');
        }
    
    
    
} catch (error) {
    
    console.log("error from checkout controller payment failure",error);
}
}

const deleteOrderFailedPayment = async (req, res) => {
  try {
    const { orderId } = req.query;
    const userId = req.session.user._id;

    console.log(`orderId: ${orderId}, userId: ${userId}`);

    // Deleting the order with both orderId and userId to ensure the user is deleting their own order
    const orderData = await Order.deleteOne({ _id: orderId, userId: userId });

    if (orderData.deletedCount > 0) {
      res.status(200).json({ success: true });
      console.log("Order deletion completed...");
    } else {
      res.status(404).json({ message: 'Order not found' });
      console.log("Order not found...");
    }

  } catch (error) {
    console.log("Error from orderController deleteOrder", error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}



const walletUpdate = async(req,res) =>{
  try {
    console.log(req.body,"==========Body=========");
    const walletBalance = req.body.walletBalance
    const userData = await User.findById(req.session.user._id)
    const wallet = userData.wallet
    const updatedBalance = wallet-walletBalance;
    console.log(wallet,updatedBalance,"============balances================");
    userData.wallet = updatedBalance;
    const saved = await userData.save()
    console.log(saved,"saved data");
    if(saved){
      res.status(200).json({success:true})
    }
  } catch (error) {
    console.error("error from checkout controller wallet Update",error);
  }
}




const cancelOrder = async(req,res) => {
    try {
        const { id } = req.query;
        const orderData = await Order.findByIdAndUpdate(id, {$set:{"orderStatus":'Cancelled'}},{new:true})
        const order = await Order.findById(id).populate('userId').populate('products.productId')
        console.log(orderData)
        if(orderData){
          if(order.orderStatus == 'Cancelled' && order.payment_status == 'Success'){
            // Update Order in Database
        const updatedOrder = await User.findByIdAndUpdate(
            order.userId._id,
            { $inc: { wallet: order.totalAmount } },
            { new: true } // Return the updated document
          );
          if(updatedOrder){
            // Use for...of loop to iterate over products
    for (const item of order.products) {
      const product = item.productId; // Get the populated product document

      // Error handling: Skip if product is not found
      if (!product) {
        console.error("Product not found for item:", item);
        continue;
      }

      const size = item.size;
      const quantity = item.quantity;

      // Find the size object within the product's sizes array
      const sizeToUpdate = product.sizes.find(s => s.size === size); 

      // Error handling: Skip if size is not found
      if (!sizeToUpdate) {
        console.error("Size not found for product:", product, "size:", size);
        continue;
      }
      product.orderCount -= quantity

      // Update the stock quantity for the specific size
      sizeToUpdate.stock += quantity;
      const saved = await product.save(); // Save the updated product
      if(saved){
        res.status(200).json({success:true})
      }
    }
    
        }
        }
        }
    } catch (error) {
        console.log("error from checkout controller deleteOrder",error);
    }
}


const returnOrder = async(req,res) => {
  try {
      const { id } = req.query;
      const orderData = await Order.findByIdAndUpdate(id, {$set:{"orderStatus":'Return'}},{new:true})
      console.log(orderData)
      if(orderData){
          res.status(200).json({success:true})
      }
  } catch (error) {
      console.log("error from checkout controller deleteOrder",error);
  }
}

// ========================original load order details===============================
// const loadOrderDetails = async(req,res) =>{
//     try {
//         let cartId= req.query.cartId
//         const id = req.query.id
//         console.log("cart ", cartId);
//         const order = await Order.findById(id).populate('products.cartId').populate('addressId')
//         const cart= await Cart.findById(cartId).populate('products.productId')
//         console.log(cart,'load order details============================');
        
//         res.render('orderDetails',{order,cart})
//     } catch (error) {
//         console.log("error from checkout controller load order details");
//     }
// }

const loadOrderDetails = async (req, res) => {
    try {
      const { id } = req.query; // Destructure id from query parameters
  
      // Fetch the order using findById and populate related models
      const order = await Order.findById(id).populate('products.productId'); // Populate address details
      const addressId=order.addressId.toString()
        const address= await Address.findOne({userId:req.session.user._id})
        const match = address.address.find(address=> address._id.equals(addressId))
        // address.address.forEach(add)
        console.log(match,"======match=====");
        console.log(address,"====address====");
      if (!order) {
        return res.status(404).send('Order not found'); // Handle non-existent order
      }
      console.log("=====================",order,order.products.cartId,order.addressId,'===============');
    
      
      // Handle potential errors during cart retrieval (optional)
      try {
        // const cartId = req.query.cartId; // Optional: If using cartId
        // const cart = await Cart.findById(cartId).populate('products.productId'); // Populate cart items (if needed)
        res.render('orderDetails', { order,address:match }); // Render order details with cart (optional)
      } catch (cartError) {
        console.error('Error fetching load order details:', cartError);
        // Handle cart retrieval errors appropriately (e.g., log, send error response)
      }
  
    //   res.render('orderDetails', { order }); // Render order details without cart (default)
    } catch (error) {
      console.error('Error loading order details:', error);
      res.status(500).send('Internal Server Error'); // Handle unexpected errors
    }
  };


  const loadInvoice = async(req,res)=>{
    try {
      console.log("###############invoice #############");
        const userId=req.session.user._id
        const orderId=req.query.orderId
        


        const user=req.session.user.name
        console.log("username",user);
        
        
        console.log("orderId ",orderId);
        const orderData = await Order.findOne({_id: orderId })
       .populate('products.productId')
       
       .populate('userId')

       const addressId=orderData.addressId.toString()
        const address= await Address.findOne({userId:req.session.user._id})
        const match = address.address.find(address=> address._id.equals(addressId))
        // address.address.forEach(add)
       

      
      //  const address= await Address.findOne({userId:req.session.user._id})
     
      
       if(orderData)
            {
                console.log("userNAme",orderData.userId.name);
                console.log("order data find",orderData);
                const orderIdd=orderData._id
                console.log("order",orderIdd);
                // const orderDetails= orderData.products.find(pro=>pro._id.toString() === orderId)
                // if(orderDetails)
                //     {
                        // const coupon=await  Coupon.findById(orderDetails.coupon)
                        // console.log("coupon",coupon);
                     
                        console.log("find order detailas");
                        res.render('invoice',{order:orderData, address:match})
                    // }else
                    // {
                    //     console.log("orderDetails not founded");
                    // }
            }
            else
            {
                console.log("orderData not found");
            }
        
    } catch (error) {
        
        console.log("error from checkoutControllwer loadInvoice",error);
    }
}
  
const applyCoupon = async (req,res)=>{
//   const { selectedCoupon, orderTotal } = req.body;
// console.log(selectedCoupon,orderTotal,"body of apply coupon");
//   try {
//     const coupon = await Coupon.findOne({ code: selectedCoupon });

//     if (!coupon || !coupon.isActive) {
//       console.log("!coupon || !coupon.isActive");
//       return res.status(400).json({ success: false, message: 'Invalid or inactive coupon' });
//     }

//     else if (coupon.minimumOrderAmount > orderTotal) {
//       console.log("coupon.minimumOrderAmount > orderTotal");
//       return res.status(400).json({ success: false, message: 'Minimum order amount not met' });
//     }

//     else if (coupon.endDate < Date.now()) {
//       console.log("coupon.endDate < Date.now()");
//       return res.status(400).json({ success: false, message: 'Coupon has expired' });
//     }

//     // Handle successful coupon application (update order, calculate discount, etc.)
//     // ... your logic to apply coupon ...
//  else{
//   console.log("apply coupon successs ");
//     res.status(200).json({ success: true });
//  }
try{
  const { couponCode } = req.body;
  const list = await Cart.findOne({userId:req.session.user._id}); // Example list object with total amount
  const coupons = await Coupon.find({})
  const coupon = coupons.find(c => c.code === couponCode);

  if (coupon && coupon.isActive && coupon.minimumOrderAmount <= list.total && new Date(coupon.endDate) >= new Date()) {
    let discount;
    if(coupon.discountType == "percentage"){
      discount = coupon.discountValue * (list.total/100)
    }else{
      discount = coupon.discountValue
    } // Example discount value, calculate based on your business logic
    const newTotal = list.total - discount;
    res.json({ success: true, newTotal });
  } else {
    res.json({ success: false, message: 'Invalid or expired coupon.' });
  }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error applying coupon' });
  }

}




module.exports = {
    loadCheckout,
    CashOnDelivery,
    cancelOrder,
    returnOrder,
    loadOrderDetails,
    loadInvoice,
    razorpay,
    verifyPayment,
    RazorPay,
    paymentFailure,
    deleteOrderFailedPayment,
    walletUpdate,
    applyCoupon
    
}