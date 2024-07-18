const User = require('../models/userModel')
const bcrypt = require('bcrypt')
const helpers = require('../helpers/hash');
const Product= require('../models/productModel');
const Category = require('../models/categoryModel');
const Cart = require('../models/cartModel')
const Order = require('../models/orderModel')
const Address = require('../models/addressModel')
const Wishlist = require('../models/wishlistModel')
const forgetPassword = require('../helpers/forgotPassword') 
const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config()


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_ADDRESS,
        pass: process.env.GMAIL_APP_PASSWORD
    }
})

const randomstring = require('randomstring')

const loadMainHome = async (req, res) => {
    // let productData = await Product.find({ is_delete:false })
    let categoryData = await Category.find({ is_delete: false });

    // ==================================

    
    var search = "";
    var filter = "";
    let userId;
    if(req.session.user)
        {
            userId=req.session.user._id
        }
    if(req.query.filter){
        filter = req.query.filter
    }
    if (req.query.search) {
      search = req.query.search;
    }

  let page = parseInt(req.query.page) || 1;
  let limit = 8;

  let startIndex = (page - 1) * limit;
//   let cart = await Cart.findOne({userId:userId})
//   let wishlist = await Wishlist.findOne({userId:userId})
//   let countWishlist=0
//   let  countCart=0

//   if(cart && wishlist)
//     {
//         countWishlist = wishlist.products.length
//         countCart = cart.products.length
//         console.log("wishlist.........",countWishlist);

//     }

    

//   const categoryFilter = req.query.filter;
//   let category;
  

  const sortOption = req.query.sort;
  let sortCriteria;

switch (sortOption) {
    case 'Popularity':
        sortCriteria = { orderCount: -1 };
        break;
    case 'Price:LowToHigh':
        sortCriteria = { promoPrice: 1 };
        break;
    case 'Price:HighToLow':
        sortCriteria = { promoPrice: -1 };
        break;
    // case 'averageRatings':
    //     sortCriteria = { averageRating: -1 };
    //     break;
    case 'Featured':
        sortCriteria = { featured: -1 };
        break;
    case 'NewArrivals':
        sortCriteria = { arrivalDate: -1 };
        break;
    case 'aToZ':
        sortCriteria = { name: 1 };
        break;
    case 'zToA':
        sortCriteria = { name: -1 };
        break;
    default:
        sortCriteria = { arrivalDate: -1 };
}
  
  let productData = await Product.find({is_delete:false,
    $and: [
        { name: { $regex: search, $options: "i" } },
        { category: filter ? filter.toString() : { $exists: true } }
    ]
}).sort(sortCriteria).skip(startIndex).limit(limit);
  let totalDocuments = await Product.countDocuments();

  let totalPages = Math.ceil(totalDocuments / limit);


  if(req.session?.user){
    if(req.session?.user?.name){
var userData = req.session.user.name
    }
    else if(req.session?.passport?.user?.name){
        userData=req.session.passport.user.name
    }
}else{
    userData=null
}


    // ==================================
  
    if (req.session.user) {
    //   let userData = await User.findById(req.session.user._id);
      let cartData = await Cart.findOne({ userId: req.session.user._id });
      let wishlistData = await Wishlist.findOne({ userId: req.session.user._id });
      wishlistCount = wishlistData?.products?.length ?? 0;
      cartCount = cartData?.products?.length ?? 0;
      
      req.session.user = userData;
      res.render("home", {
        user:userData,
        products:productData,
        categories:categoryData,
        cart:cartCount,
        wishlist:wishlistCount,

        
           
            page,totalPages,
            sortOption,
            
            filter,search
            
           
      });
    } else {
      res.render("mainHome", { productData, categoryData });
    }
  };


const loadLandingpage=async(req,res)=>{
    try {

        var search = "";
        var filter = "";
        let userId;
        if(req.session.user)
            {
                userId=req.session.user._id
            }
        if(req.query.filter){
            filter = req.query.filter
        }
        if (req.query.search) {
          search = req.query.search;
        }

      let page = parseInt(req.query.page) || 1;
      let limit = 8;
  
      let startIndex = (page - 1) * limit;
      let cart = await Cart.findOne({userId:userId})
      let wishlist = await Wishlist.findOne({userId:userId})
      let countWishlist=0
      let  countCart=0

      if(cart && wishlist)
        {
            countWishlist = wishlist.products.length
            countCart = cart.products.length
            console.log("wishlist.........",countWishlist);

        }
  
        

    //   const categoryFilter = req.query.filter;
      let category;
      

      const sortOption = req.query.sort;
      let sortCriteria;

    switch (sortOption) {
        case 'Popularity':
            sortCriteria = { orderCount: -1 };
            break;
        case 'Price:LowToHigh':
            sortCriteria = { promoPrice: 1 };
            break;
        case 'Price:HighToLow':
            sortCriteria = { promoPrice: -1 };
            break;
        // case 'averageRatings':
        //     sortCriteria = { averageRating: -1 };
        //     break;
        case 'Featured':
            sortCriteria = { featured: -1 };
            break;
        case 'NewArrivals':
            sortCriteria = { arrivalDate: -1 };
            break;
        case 'aToZ':
            sortCriteria = { name: 1 };
            break;
        case 'zToA':
            sortCriteria = { name: -1 };
            break;
        default:
            sortCriteria = { arrivalDate: -1 };
    }
      const categories = await Category.find()
      let product = await Product.find({is_delete:false,
        $and: [
            { name: { $regex: search, $options: "i" } },
            { category: filter ? filter.toString() : { $exists: true } }
        ]
    }).sort(sortCriteria).skip(startIndex).limit(limit);
      let totalDocuments = await Product.countDocuments();
  
      let totalPages = Math.ceil(totalDocuments / limit);




        console.log(req.session,"session details");
        if(req.session?.user){
            if(req.session?.user?.name){
        var user = req.session.user.name
            }
            else if(req.session?.passport?.user?.name){
            user=req.session.passport.user.name
            }
        }else{
        user=null
        }
        console.log(product,"========products load home=========");
        // const product = await Product.find({})
        res.status(200).render('home',{user:user,
            products:product,
            page,totalPages,
            sortOption,
            categories,
            filter,search,
            cart:countCart,
            wishlist:countWishlist
        })
    } catch (error) {
        
        console.log(error);
    }
}


// const loadLandingpage = async (req, res) => {
//     try {
//       const { search, filter, sort, page = 1, limit = 8 } = req.query;
//       const userId = req.session.user?._id;
  
//       // Fetch cart and wishlist data
//       const cart = await Cart.findOne({ userId });
//       const wishlist = await Wishlist.findOne({ userId });
//       const countCart = cart?.products?.length || 0;
//       const countWishlist = wishlist?.products?.length || 0;
  
//       // Build query object
//       const query = { is_delete: false };
//       if (search) {
//         query.name = { $regex: search, $options: 'i' };
//       }
//       if (filter) {
//         query.category = filter;
//       }
  
//       // Build sort object
//       const sortOption = {
//         Popularity: { orderCount: -1 },
//         'Price:LowToHigh': { promoPrice: 1 },
//         'Price:HighToLow': { promoPrice: -1 },
//         Featured: { featured: -1 },
//         'NewArrivals': { arrivalDate: -1 },
//         'aToZ': { name: 1 },
//         'zToA': { name: -1 },
//       };
//       const sortCriteria = sortOption[sort] || { arrivalDate: -1 };
  
//       // Pagination
//       const startIndex = (page - 1) * limit;
  
//       // Fetch categories and products
//       const categories = await Category.find();
//       const product = await Product.find(query)
//         .sort(sortCriteria)
//         .skip(startIndex)
//         .limit(limit);
//       const totalDocuments = await Product.countDocuments(query);
//       const totalPages = Math.ceil(totalDocuments / limit);


//       console.log(req.session,"session details");
//               if(req.session?.user){
//                   if(req.session?.user?.name){
//               var user = req.session.user.name
//                   }
//                   else if(req.session?.passport?.user?.name){
//                   user=req.session.passport.user.name
//                   }
//               }else{
//               user=null
//               }
//               console.log(product,"========products load home=========");
//               // const product = await Product.find({})
//               res.status(200).render('home',{user:user,
//                   products:product,
//                   page,totalPages,
//                   sortOption,
//                   categories,
//                   filter,search,
//                   cart:countCart,
//                   wishlist:countWishlist
//               })
  
//       // ... rest of the code ...
//     } catch (error) {
//       console.error(error);
//       res.status(500).send('An error occurred');
//     }
//   };


const signUpLoad = async(req,res)=>{
    try {
        res.render('signUp',{message:'Now Login'})
    } catch (error) {
        console.log(error.message+'error from userscontroller signupload')
    }
}

const insertUser = async(req,res,next) => {
    
        try {
            console.log(req.body);
            const mail = req.body.email
            const mobile = req.body.mno

            const unique = await User.findOne({ $or: [{ email: mail}, { mobile: mobile}]})

            console.log(unique)
            if(unique){
                res.render('login',{message:"",message1:"You already have an account. Please login"})
            } else {
                const Spassword = await helpers.securePassword(req.body.password)
                var uname=req.body.username
                const generateReferralCode = (uname) => {
                    const randomString = crypto.randomBytes(3).toString('hex').toUpperCase();
                    return `${uname.substring(0, 3).toUpperCase()}${randomString}`;
                };

                console.log(generateReferralCode('John')); // Example output: 'JOH9F86D0'
                const referalCode=generateReferralCode(uname)

                                // const user = new User({
                //     name:req.body.username,
                //     email:req.body.email,
                //     mobile:req.body.mno,
                //     password:Spassword,
                //     is_admin:0,
                //     is_block:false
                // })

                const user = {
                        name:req.body.username,
                        email:req.body.email,
                        mobile:req.body.mno,
                        password:Spassword,
                        is_admin:0,
                        is_block:false,
                        referalCode:referalCode
                    }
                // const userData = await user.save()

                // if(userData){

                //     res.render('login',{message:"",message1:"Successfully Registered. Please login"})
                //     // next()


                // } else {
                //     res.render('signUp',{message:'Your registration has been failed!'})
                // }

                req.session.temp = user;
                res.redirect('/verify')
                
            }
        } catch (error) {
            console.log(error.message+'user insert error')
        }
    
}


const loadForgotPassword = async(req,res) => {
    try {
        res.render('forgotPassword')
    } catch (error) {
        console.log("error from userscontroller load forgot password",error)
    }
}

const forgotPassword = async(req,res) => {
    try {
        const email = req.body.email
        const userData = await User.findOne({email:email})

        if(userData){
             const randomString = randomstring.generate()
             const data = await User.updateOne({email:email},{$set:{token:randomString}})

             if(data){
                forgetPassword.sendresetPasswordMail(userData.name,userData.email,randomString)
                req.session.token=randomString
                res.render('forgotPassword',{msg:'check your mail inbox and reset your password'})
             } else{
                res.render('forgotPassword',{msg:'Your email is not valid'})
             }
        }
    } catch (error) {
        console.log("error from userscontroller forgot password")
    }
}

const loadResetPassword = async(req,res) => {
    try {
        res.render('resetPassword')
    } catch (error) {
        console.log('error from users controller load resetpassword',error);
    }
}

const resetPassword = async(req,res) => {
    try {
        const token = req.session.token
        const tokenData = await User.findOne({token:token})
        console.log(token,"==============",tokenData,"=======================");

        if(tokenData){
            const password = req.body.password
            const Spassword = await helpers.securePassword(password)

            const userData = await User.findByIdAndUpdate({_id:tokenData._id},{$set:{password:Spassword,token:''}},{new:true})
            res.redirect('/login')
        }
    } catch (error) {
       console.log("error from userscontroller resetpassword"); 
    }
}

const loginLoad = async(req,res)=>{
    try{
        res.render('login',{message:"",message1:""})
    } catch (error) {
        console.log(error.message+"error from userscontroller loginload")
    }
}




const loadAbout = async(req,res) => {
    try {
        res.render('about')
    } catch (error) {
        console.log("error from userscontroller loadabout")
    }
}


const loadContact = async(req,res) => {
    try {
        res.render('contact')
    } catch (error) {
       console.log("error from userscontroller loadcontact") 
    }
}

const verifyLogin = async(req,res) => {

    try {
        console.log(req.body)
        const email = req.body.email
        const password = req.body.password

        const userData = await User.findOne({ email:email})
        // console.log(userData,"userdata aanu ith");
        if(userData){
            if(userData.is_block){
                res.render('login',{message:"You are blocked!",message1:''})
            }
            const passwordMatch = await bcrypt.compare(password,userData.password)
            // console.log(passwordMatch,"password sheriyaaa");
            if(passwordMatch){
                // console.log(userData.is_admin,"adminaanu");
                if(userData.is_admin == 0){
                    req.session.user = {
                        _id: userData._id,
                        email: email,
                        name: userData.name,
                        is_block:userData.is_block
                    };
                    if(userData.is_verified){

                    req.user = await User.findById({_id:req.session.user._id})
                    console.log(req.user,"verify login user controller")
                    res.redirect('/home')
                    }
                    else{
                        res.redirect('/verify')
                    }
                } else {
                    res.render('login',{message:'Enter correct details',message1:""})
                }
            } else {
                res.render('login',{message:'Password is incorrect',message1:''})
            }
            
        } else {
            res.render('login',{message:'Email and password is incorrect',message1:''})
        }
        
    } catch (error) {
        console.log("error form usercontroller verifylogin")
    }
}



const loadProductDetails = async(req,res) => {
    try {
        const id = req.query.id
        const product = await Product.findById({_id:id})
        const relatedProduct = await Product.find({category:product.category})
        const totalstock = product.sizes.reduce((a, size) => (a + size.stock), 0);
        const cat= await Category.findById({_id:product.category})
        const catname= cat.name
        console.log(catname,"asdfghjkwertyui");
        res.render('productDetails',{product:product,totalstock:totalstock,relatedProduct:relatedProduct,catname})
    } catch (error) {
        console.log("error from usercontroller loadproductdetails")
    }
}  
      



const userLogout = async(req,res) => {
    try {
        req.session.destroy()
        // req.session.user = null
        res.redirect('/login')
    } catch (error) {
       console.log("error from userscontroller userlogout",error) 
    }
}


const  loadSuccessGoogle=async(req,res)=>{
    try {
        if(!req.user)
            {
               
                res.redirect('/failure')
                console.log(req.user);
            }
            else
    
            {
                req.session.user={
                    _id:req.user._id
                }
                
                console.log("success",req.user._id);
                // const message = Success: ${req.user.email};
                res.status(200).redirect('/home')
    
            }
        
    } catch (error) {
        
        console.log("error from userController loadSuccessGoogle",error);
    }
}

const loadFailureGoogle=async(req,res)=>{
    try {   

        console.log('failure')
        
        res.status(400).redirect('/login')
    } catch (error) {
        
        console.log("error from usersController loadFailureGoogle",error);
    }
}

const loadProfile=async(req,res)=>{
    try {


        const userId=req.session.user._id
        const userData = await Address.find({userId})
        const user=await User.findById(userId)
        console.log("user",user,userData);

    //    const address= userData.address.forEach(userData=>{[...userData.address]})
        const orderData=await Order.find({ userId }).sort({date:-1})
        console.log("order data",orderData);
       const address = userData.map(user => user.address);



        res.render('profile',{user,address,orders:orderData})

        
    } catch (error) {
        
        console.log("error from usercontroller loadProfile",error);
    }
}



const loadeditUser=async(req,res)=>{
    try {

        const userId=req.session.user._id
        const user=await User.findById(userId)
        res.render('editUser',{user})
        
    } catch (error) {
        
        console.log("error from usercontroller loadeditUser",error);
    }
}


const editUser=async(req,res)=>{
    try {
        const {username , mobile }=req.body

        const userId=req.query.id
        const editUser=await User.findByIdAndUpdate(userId,{$set:{name:username,mobile:mobile}})
        if(editUser)
            res.redirect('/profile')
        else
        
        console.log("not Updated ");
        
    } catch (error) {
        
        console.log("error from userCOntroller editUser ",error);
    }
}



const loadChangePassword=async(req,res)=>{
    try {

        res.render('changepassword')
        
    } catch (error) {
        
        console.log("error from userController loadChangePassword",error);
    }
}



const ChangePassword=async(req,res)=>{
    try {
        
        const userId=req.query.id
        const cpassword=req.body.cpassword 
        console.log("=================================,cpassword",cpassword);
        const Spassword=await helpers.securePassword(cpassword)
        console.log(Spassword,"hashed  password ==================================");
        const UserUpdate=await User.findByIdAndUpdate(userId,{$set:{password:Spassword}})
        if(UserUpdate){
            res.redirect('/profile')
        }
        else 
        console.log("usernot upddated");

        
    } catch (error) {
        console.log("error from userController ChangePassword",error);
        
    }
}



const loadAddAddress=async(req,res)=>{
    try {
        res.render('addAddress')
        
    } catch (error) {
        
        console.log("error from userController loadAddAddress",error);
    }
}


const AddAddress = async(req,res) =>{
    try {
        console.log(req.body,"=========addAddress===================");
       const id= req.session?.user?._id?req.session.user._id:req.session?.passport?.user?._id
       const address= await Address.findOne({userId:id})
       if(!address){
       const address=new Address( {userId:id,
        address:{name:req.body.name,
            country:req.body.country,
            state:req.body.state,
            street:req.body.street,
            city:req.body.city,
            pincode:req.body.pincode,
            mobile:req.body.mno}})
            const saved=await address.save()
            if(saved){
                res.redirect('/profile')
            }
        }else{
         address.address.push({name:req.body.name,
                country:req.body.country,
                state:req.body.state,
                street:req.body.street,
                city:req.body.city,
                pincode:req.body.pincode,
                mobile:req.body.mno})
                await address.save()
                res.redirect('/profile')
        }
    } catch (error) {
        console.log("error form user controller addaddress",error);
    }
}


const deleteAddress = async(req,res) =>{
    try {
        const user = req.session.user._id
        const id = req.query.id || req.body.id
        const useraddress = await Address.findOne({userId:user})

        if(useraddress){
            const addressToDelete = useraddress.address.find(address => address._id.equals(id));
            if(addressToDelete){
                const updatedAddress = useraddress.address.filter(address => !address._id.equals(id))
                useraddress.address = updatedAddress;

                await useraddress.save();

            } else {
                console.error(`Address with ID ${id} not found.`);
            }
        }

        res.status(200).json({success:true})
    } catch (error) {
        console.log("error from userscontroller delete address ");
    }


}


const loadEditAddress = async(req,res) => {
    try {
        const id = req.query.id
        const user = req.session.user._id

        const userAddress = await Address.findOne({userId:user})
        const findAddress = userAddress.address.find(address => address._id.equals(id));

        res.render('editAddress',{userAddress:findAddress})

    } catch (error) {

        console.log("error from userscontroller loadedit address");
    }
}

const editAddress = async(req,res) => {
    try {
        const addressId = req.query.id
        const user = req.session.user._id
        const {name,mno,country,state,city,street,pincode} = req.body

        const userAddress = await Address.findOne({userId:user})
        const findAddress = userAddress.address.find(address => address._id.equals(addressId))
        console.log(findAddress,"=========");
        if(findAddress){
            findAddress.name = name
            findAddress.mobile = mno
            findAddress.country = country
            findAddress.state = state
            findAddress.city = city
            findAddress.street = street
            findAddress.pincode = pincode

            const saved = await userAddress.save()
            console.log(saved,'======saved=====');
            if(saved){
                res.redirect('/profile')
            } else {
                res.render('editAddress',{msg:'Address not edited'})
            }

        }

    } catch (error) {
        console.log("error from userscontroller edit address",error);
    }
}


const referral = async(req,res) => {
    try {
        const user= await User.findById(req.session.user._id)
        if(user.referedBy ==''||user.referedBy == null || user.referedBy == undefined){
        const referalCode = req.body.referalCode
        console.log(req.body,referalCode);
        const referedBy = await User.findOne({referalCode:referalCode})
        console.log(referedBy,"refered user");
        console.log(referedBy._id.toString(),req.session.user._id.toString(),"refrred id's");
        
        if(referedBy._id.toString()==req.session.user._id.toString()){
            // add to referredby field check is refferedby field is not empty then only come to this area
            console.log("if conditionil keri referalil ulle");
            res.status(400).json({success:false,message:'You cant refer yourself'})
        }else{
            user.referedBy=referedBy.name
            await user.save()
            referedBy.wallet +=100;
            const save = await referedBy.save()
            if(save){
                res.status(200).json({success:true})
            }
        }
    }else{
        res.status(400).json({message:"You are already reffered"})
    }
    } catch (error) {
        console.log("error from user controller referral",error);
    }


}

const refer = async(req,res) => {
    try {
        const email = req.body.email
        const user = await User.findById(req.session.user._id)
        const referralCode = user.referalCode
        const mailOptions = {
            from: 'your_email@example.com', // Replace with your email address
            to: email,
            subject: 'Your Referral Code',
            text: `Hi there,
      
      Your referral code is: ${referralCode}
      
      Use this code to refer your friends and earn rewards!
      
      Thanks,
      The [Your Company Name] Team`,
            html: `<!DOCTYPE html>
      <html>
      <body>
        <p>Hi there,</p>
        <p>Use this referral code and earn rewards!: <b>${referralCode}</b></p>
        <p>And you can earn more by referring your friends too.. </p>
        <p>Thanks,</p>
        <p>The Calos Team</p>
      </body>
      </html>
      `,
          };
          console.log(mailOptions);
          await transporter.sendMail(mailOptions);
          
        
    } catch (error) {
        console.log("error from user controller refer",error);
    }
}

module.exports={
    loadMainHome,
    loadLandingpage,
    loginLoad,
    loadForgotPassword,
    forgotPassword,
    loadResetPassword,
    resetPassword,
    signUpLoad,
    loadAbout,
    loadContact,
    insertUser,
    verifyLogin,
    userLogout,
    loadProductDetails,
    loadSuccessGoogle,
    loadFailureGoogle,
    loadProfile,
    loadeditUser,
    editUser,
    loadChangePassword,
    ChangePassword,
    loadAddAddress,
    AddAddress,
    deleteAddress,
    loadEditAddress,
    editAddress,
    referral,
    refer


}