const express = require('express')
const userRoute= express()

const { isLogin,isLogout,isLogin1 } = require('../middlewares/userAuth')
const usersController =require('../controllers/usersController')
const { verify, verified } = require('../helpers/otp')
const cartController=require('../controllers/cartController')
const checkoutController = require('../controllers/checkoutController')
const wishlistController = require('../controllers/wishlistController')


const setNoCacheHeaders = (req, res, next) => {
   res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
   res.setHeader('Pragma', 'no-cache');
   res.setHeader('Expires', '0');
   next();
};

const passport = require('passport')
require('../helpers/google')

userRoute.use(passport.initialize())
userRoute.use(passport.session())

userRoute.set('view engine','ejs')
userRoute.set('views','./views/users')



userRoute.get('/auth/google',passport.authenticate('google',{scope:['email','profile']}))

userRoute.get('/auth/google/callback',
 passport.authenticate('google',{
    successRedirect:'/success',
    failureRedirect:'/failure'
 })
)  
    

userRoute.get('/success',usersController.loadSuccessGoogle)
userRoute.get('/failure',usersController.loadFailureGoogle)
userRoute.get('/',setNoCacheHeaders,usersController.loadMainHome)
userRoute.get('/login',isLogout,setNoCacheHeaders,usersController.loginLoad)
userRoute.post('/login',usersController.verifyLogin)
userRoute.get('/forgotPassword',usersController.loadForgotPassword)
userRoute.post('/forgotPassword',usersController.forgotPassword)
userRoute.get('/resetPassword',usersController.loadResetPassword)
userRoute.post('/resetPassword',usersController.resetPassword)

userRoute.get('/verify',verify)
userRoute.post('/verify',verified)
userRoute.get('/home',isLogin,setNoCacheHeaders,usersController.loadLandingpage)
userRoute.get('/signUp',usersController.signUpLoad)
userRoute.post('/signUp',usersController.insertUser)
userRoute.get('/about',usersController.loadAbout)
userRoute.get('/contact',usersController.loadContact)
userRoute.get('/logout',isLogin,usersController.userLogout)
userRoute.get('/product/detail',usersController.loadProductDetails)

userRoute.get('/product/cart',isLogin,cartController.loadCart)
userRoute.put('/product/cart/quantity',isLogin,cartController.changeQuantity)
userRoute.put('/cart/quantity',isLogin,cartController.quantityUpdate)
userRoute.post('/product/addToCart',isLogin,cartController.addtoCart)
userRoute.delete('/product/delete',isLogin,cartController.deleteCart)
userRoute.get('/product/availableStock',isLogin,cartController.availableStock)

userRoute.get('/checkout',isLogin,checkoutController.loadCheckout)
userRoute.post('/order/payment/cod',isLogin,checkoutController.CashOnDelivery)
userRoute.post('/order/payment/razorpay',isLogin,checkoutController.RazorPay)
userRoute.post('/create/orderId',isLogin,checkoutController.razorpay)
userRoute.post('/api/payment/verify',isLogin,checkoutController.verifyPayment)
userRoute.get('/payment-failure',isLogin,checkoutController.paymentFailure)
userRoute.delete('/delete/order/',isLogin,checkoutController.deleteOrderFailedPayment)
userRoute.put('/wallet/update',isLogin,checkoutController.walletUpdate)
userRoute.put('/order/cancel',isLogin,checkoutController.cancelOrder)
userRoute.put('/order/return',isLogin,checkoutController.returnOrder)


userRoute.get('/profile/order/detail',isLogin,checkoutController.loadOrderDetails)
userRoute.get('/order/invoice',isLogin,checkoutController.loadInvoice)
userRoute.post('/apply-coupon',isLogin,checkoutController.applyCoupon)
// userRoute.post('/apply-coupon',isLogin,checkoutController.ApplyingCoupon) 
// userRoute.get('/coupon/used',isLogin,checkoutController.userUsedCoupon)
// userRoute.put('/coupon/remove',isLogin,checkoutController.removeCoupon) 


userRoute.get('/profile',isLogin,usersController.loadProfile)
userRoute.get('/profile/account/edit',isLogin,usersController.loadeditUser)
userRoute.post('/profile/account/edit',isLogin,usersController.editUser)
userRoute.get('/profile/account/changepassword',isLogin,usersController.loadChangePassword)
userRoute.post('/profile/account/changepassword',isLogin,usersController.ChangePassword)
userRoute.get('/profile/address/add',isLogin,usersController.loadAddAddress)
userRoute.post('/profile/address/add',isLogin,usersController.AddAddress)
userRoute.delete('/profile/address/remove',isLogin,usersController.deleteAddress)
userRoute.get('/profile/address/edit',isLogin,usersController.loadEditAddress)
userRoute.post('/profile/address/edit',isLogin,usersController.editAddress)
userRoute.post('/profile/referral',isLogin,usersController.referral)
userRoute.post('/profile/refer',isLogin,usersController.refer)


userRoute.get('/wishlist',isLogin,wishlistController.loadWishlist)
userRoute.get('/wishlist/add',isLogin,wishlistController.addWishlist)
userRoute.delete('/wishlist/delete',isLogin,wishlistController.removeWishlist)



module.exports = userRoute 

 