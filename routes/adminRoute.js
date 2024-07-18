const express = require('express')
const adminRoute = express()

const adminController = require('../controllers/adminController')
const adminAuth = require('../middlewares/adminAuth')
const offerController = require('../controllers/offerController')

const multer = require('../helpers/multer')

adminRoute.set('view engine','ejs')
adminRoute.set('views','./views/admin') 

const setNoCacheHeaders = (req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
};


adminRoute.get('/',adminAuth.isLogout,setNoCacheHeaders,adminController.loadLogin)
adminRoute.post('/',adminController.verifyLogin)
adminRoute.get('/home',adminAuth.isLogin,setNoCacheHeaders,adminController.loadHome)
adminRoute.get('/ordersgraph',adminAuth.isLogin,adminController.getOrdersGraphData)
adminRoute.get('/download-orders-pdf',adminAuth.isLogin,adminController.pdfDownloadOrders)
adminRoute.get('/userslist',adminAuth.isLogin,adminController.loadUserslist)
adminRoute.get('/unblock',adminAuth.isLogin,adminController.unblock)
adminRoute.delete('/block',adminAuth.isLogin,adminController.block)
adminRoute.get('/logout',adminAuth.isLogin,adminController.adminLogout)


// routes for categories
adminRoute.get('/category',adminAuth.isLogin,adminController.loadCategory)
adminRoute.post('/category',adminAuth.isLogin,adminController.insertCategory)
adminRoute.delete('/deletecategory',adminAuth.isLogin,adminController.deleteCategory)
adminRoute.get('/addcategory',adminAuth.isLogin,adminController.addCategory)
adminRoute.get('/editcategory',adminAuth.isLogin,adminController.loadEditCategory)
adminRoute.post('/editcategory',adminAuth.isLogin,adminController.editCategory)

// routes for products
adminRoute.get('/products',adminAuth.isLogin,adminController.loadProducts)
adminRoute.get('/addproducts',adminAuth.isLogin,adminController.loadAddProducts)
adminRoute.post('/addproducts',adminAuth.isLogin,multer,adminController.insertProduct)
adminRoute.delete('/deleteproducts',adminAuth.isLogin,adminController.deleteProduct)
adminRoute.get('/product/unblock',adminAuth.isLogin,adminController.addproduct)
adminRoute.get('/editProduct',adminAuth.isLogin,adminController.editProduct)
adminRoute.post('/editProduct',adminAuth.isLogin,multer,adminController.updateProduct)
adminRoute.delete('/delete-image',adminAuth.isLogin,adminController.deleteimage)

// routes for orders
adminRoute.get('/orders',adminAuth.isLogin,adminController.loadOrders)
adminRoute.get('/orderDetails',adminAuth.isLogin,adminController.loadOrderDetails)
adminRoute.delete('/order/cancel',adminAuth.isLogin,adminController.cancelOrder)
adminRoute.post('/order/statusChange',adminAuth.isLogin,adminController.statusChange)

adminRoute.get('/coupon',adminAuth.isLogin,adminController.loadCoupon)
adminRoute.get('/createcoupon',adminAuth.isLogin,adminController.loadCreateCoupon)
adminRoute.post('/coupon',adminAuth.isLogin,adminController.createCoupon)
adminRoute.delete("/deletecoupon",adminAuth.isLogin,adminController.deleteCoupon)

adminRoute.get('/offer',adminAuth.isLogin,offerController.loadOffer)
adminRoute.get('/offer/product/add',adminAuth.isLogin,offerController.loadProductOffer)
adminRoute.post('/offer/product/add',adminAuth.isLogin,offerController.addProductOffer)
adminRoute.get('/offer/category/add',adminAuth.isLogin,offerController.loadAddCategoryOffer)
adminRoute.post('/offer/category/add',adminAuth.isLogin,offerController.AddCategoryOffer)
adminRoute.get('/offer/edit',adminAuth.isLogin,offerController.loadEditOffer)
adminRoute.post('/offer/edit',adminAuth.isLogin,offerController.EditOffer)
adminRoute.post('/offer/apply',adminAuth.isLogin,offerController.applyOfferByproduct)
adminRoute.post('/offer/remove',adminAuth.isLogin,offerController.removeOfferByproduct)


adminRoute.get('/statistics',adminAuth.isLogin,adminController.loadStatics)



// adminRoute.get('*',(req,res)=>{
//     res.redirect('/admin/home')
// })



module.exports = adminRoute
