const User = require('../models/userModel')
const Category = require('../models/categoryModel')
const bcrypt = require('bcrypt')
const Product = require('../models/productModel')
const { errorMonitor } = require('nodemailer/lib/xoauth2')
const Cart = require('../models/cartModel')
const Address = require('../models/addressModel')
const Coupon = require('../models/couponModel'); // Replace with your coupon model path
const PDFDocument = require('pdfkit');



// const formidable = require('formidable')

const loadLogin = async(req,res)=>{
    try {
        res.render('login')
    } catch (error) {
        console.log("error from admincontroller loadLogin")
    }
}

const formidable = require("formidable");
const Order = require('../models/orderModel')

function formidableMiddleware(req, res, next) {
    console.log("req body",req.body);
    let form = new formidable.IncomingForm({
        multiples: true,       // Allow multiple file uploads
        keepExtensions: true,   // Keep original file extensions
        allowEmptyFiles: true  // Allow empty files (size 0)
    });
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Error parsing form:", err);
      return res.status(500).send("Error parsing form data");
    }

    req.body = fields;
    req.files = files;
    next(); // Continue to the next middleware or route handler
  });
}



    // Access form fields using `fields` object (e.g., fields.name)
    // Access uploaded files using `files` object (e.g., files.myfile)

    // Process the uploaded files and form data
    // ...


// const verifyLogin = async(req,res) => {
//     try {
//         const admin = {
//             username:"aziya",
//             password:"123"
//         }

//         const{username,password} = req.body

//         if(username === admin.username){
//             console.log("match username")
//             if(password === admin.password){
//                 console.log("password match")
//                 res.redirect('/admin/home')
//             }else{
//                 console.log("password is incorrect")
//             }
//         } else {
//             console.log("username is incorrect")
//         }
//     } catch (error) {
//         console.log("error from admincontroller verifylogin")
//     }
// }

const verifyLogin = async(req,res) => {
    try {
        console.log(req.body);
        const email = req.body.email
        const password = req.body.password
        const adminData = await User.findOne({email:email})
        if(adminData){
            const passwordMatch = await bcrypt.compare(password,adminData.password)
            if(passwordMatch){
                if(adminData.is_admin === 1){
                    req.session.admin = {
                        _id: adminData._id,
                        email: email,
                        name: adminData.name
                    };
                    req.admin = await User.findById({_id:req.session.admin._id})
                    console.log(req.admin,"verify login admin controller");
                    res.redirect("/admin/home")
                }
                else{ 
                    res.render('login',{message:'Enter correct details'})
                }
            } else {
                res.render('login',{message:'Password is incorrect'})
            }
        } else {
            res.render('login',{message:'Email and password is incorrect'})
        }
    } catch (error) {
        console.log("error from admicontroller verifylogin")
    }
}

const loadHome = async(req,res) => {
        try {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    

    const pastRevenue = await Order.aggregate([
        { $match: { 'date': { $gte: thirtyDaysAgo, $lt: today } } },
        { $unwind: "$products" },
        { $match: { 'date': { $gte: thirtyDaysAgo, $lt: today } } },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: { $multiply: ["$products.price", "$products.quantity"] } }
            }
        }
    ]);

    const pasttotalRevenue = pastRevenue.length > 0 ? pastRevenue[0].totalRevenue : 0;
    // console.log("Total Revenue in the Last 30 Days:", pasttotalRevenue);

    const result = await Order.aggregate([
        { $unwind: "$products" },
        { $count: "totalProductsCount" }
    ]);

    const totalProductsCount = result.length > 0 ? result[0].totalProductsCount : 0;
    // console.log("Total Count of Products:", totalProductsCount);

    const completedProducts = await Order.aggregate([
        { $match: { "orderStatus": "Delivered" } }
    ]);

    const unique = await Order.aggregate([
        { $unwind: "$products" },
        { $group: { _id: "$products.productId" } },
        { $count: "uniqueProductCount" }
    ]);

    const uniqueProductCount = unique.length > 0 ? unique[0].uniqueProductCount : 0;
    // console.log("Unique Product Count:", uniqueProductCount);

    let totalRevenue = 0;
    // console.log("Completed Products:", completedProducts);

    completedProducts.forEach(product => {
        totalRevenue += product.price;
        console.log("Product Price:", product.price);
    });

    // console.log("Total Revenue", totalRevenue);
  // Pagination variables
  let page = parseInt(req.query.page) || 1;
  const limit = 5;
  const skip = (page - 1) * limit;;


  
    const { startDate, endDate, predefinedRange } = req.query;
    let dateFilter = {};

    const calculatePredefinedRange = (range) => {
        const now = new Date();
        let start, end = new Date();

        switch (range) {
            case 'oneDay':
                start = new Date(now.setDate(now.getDate() - 1));
                break;
            case 'oneWeek':
                start = new Date(now.setDate(now.getDate() - 7));
                break;
            case 'oneMonth':
                start = new Date(now.setMonth(now.getMonth() - 1));
                break;
            case 'oneYear':
                start = new Date(now.setFullYear(now.getFullYear() - 1));
                break;
            default:
                return null;
        }

        end.setHours(23, 59, 59, 999);
        return { start, end };
    };

    if (predefinedRange) {
      const range = calculatePredefinedRange(predefinedRange);
      if (range) {
        dateFilter = {
          date: {
            $gte: range.start,
            $lte: range.end
          }
        };
      }
    } else if (startDate && endDate) {
        dateFilter = {
            date: {
                $gte: new Date(startDate),
                $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
            }
        };
    } else if (startDate) {
        dateFilter = {
            date: {
                $gte: new Date(startDate),
                $lt: new Date(new Date(startDate).setDate(new Date(startDate).getDate() + 1))
            }
        };
    }

  
const orders = await Order.aggregate([
  { $unwind: "$products" },
  { $match: dateFilter },
  {
    $group: {
      _id: "$_id",
      userId: { $first: "$userId" },
      products: { $push: "$products" },
      totalPrice: { $first: "$totalAmount" },
    //   address: { $first: "$address" },
      payment_method: { $first: "$payment_method" },
      orderStatus:{$first:"$orderStatus"},
      date: { $first: "$date" },
    //   updatedAt: { $first: "$updatedAt" }
    }
  },
  {
    $lookup: {
      from: 'users',
      localField: 'userId',
      foreignField: '_id',
      as: 'userDetails'
    }
  },
  { $unwind: "$userDetails" },
    { $skip: skip },
    { $limit: limit }
])  
console.log("orders",orders);


const totalOrders = await Order.countDocuments(dateFilter);
// console.log("total order",totalOrders);
// const totalPages = Math.ceil(totalOrders / limit);
const totalPages = totalOrders > 0 ? Math.ceil(totalOrders / limit) : 0;  // Handle empty results
// console.log("total pages ",totalPages);


if (!orders || orders.length === 0) {
  res.render('dashboard', {
    order: [],
    totalProductsCount,
    totalRevenue: 0, // Set to 0 if no orders found
    pasttotalRevenue,
    uniqueProductCount,
    message: 'No orders found for the selected date range',
    currentPage: page,
    totalPages: totalPages,
    limit: limit
  });

    } else {
        const categoryOrders = await Order.aggregate([
            { $unwind: '$products' },
            {
                $group: {
                    _id: '$products.productId',
                    productCount: { $sum: '$products.quantity' },
                },
            },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            { $unwind: '$productDetails' },
            {
                $group: {
                    _id: '$productDetails.category',
                    productCount: { $sum: '$productCount' }
                }
            }
        ]);

        res.render('dashboard', {
            order: orders,
            totalProductsCount,
            totalRevenue,
            pasttotalRevenue,
            uniqueProductCount,
            categoryOrders,
            currentPage: page,
            totalPages: totalPages,
            limit: limit
        });
    }







 
// // Flatten the products array from all orders
// let products = [];
// order.forEach(order => {
//     products = products.concat(order.products);
// });

  // if (!order || order.length === 0) {
  //     return res.status(404).send('Orders not found');
  // }
  
  // // Initialize an empty array to store paginated products
  // let products = [];
  
  // // Paginate the products array for each order document
  // order.forEach(order => {
  //     const paginatedProducts = order.products.slice((page - 1) * limit, page * limit);
  //     products = products.concat(paginatedProducts);
  // });
  
  // // Calculate total number of products across all orders
  // const totalProductsCounts = order.reduce((total, order) => total + order.products.length, 0);
  
  // // Calculate total number of pages
  // const totalPages = Math.ceil(totalProductsCounts / limit);
  
  




   

  
  
      
          console.log("dashbord rendering");
        } catch (error) {
          console.log("admin controll LoadDashboard error", error);
        }
    //   };      
    // try {
    //     res.render('home')
    // } catch (error) {
    //     console.log("error from admincontroller loadHome")
    // }
}

const loadUserslist = async(req,res) => {
    try {


        var search = "";

    if (req.query.search) {
      search = req.query.search;
    }

    console.log("search",search);


      let page = parseInt(req.query.page) || 1;
      let limit = 3;
  
      let startIndex = (page - 1) * limit;
  
      let userData =await User.find({
        is_admin: 0,
        $or: [{ name: { $regex: search, $options: "i" } }],
      })
  .skip(startIndex).limit(limit);
      let totalDocuments = await User.countDocuments()-1;
  
      let totalPages = Math.ceil(totalDocuments / limit);
  
      res.status(200).render("userslist", {
        message:"",
        users: userData,
        page,
        totalPages,
      });

        // const userData = await User.find({is_admin:0})
        // res.render('userslist',{users:userData})
    } catch (error) {
        console.log("error from admincontroller loaduserslist")
    }
}

const unblock = async(req,res) => {
    try {
        console.log(req.query.id);
        const id=req.query.id;
        const userData = await User.findByIdAndUpdate({_id:id},{$set:{is_block:false}})
        const saved=await userData.save()
        if(saved){
            res.redirect('/admin/userslist')
        }
        
    } catch (error) {
        console.log("error from admincontroller unblock")
    }
}

const block = async(req,res) => {
    try {
       const id = req.query.id

       const userData = await User.findByIdAndUpdate({_id:id},{$set:{is_block:true}})
       const saved = await userData.save()
       if(req.session.user)
        {
            req.session.user.is_block = true
            
        }else
        {
            console.log("no session ");
        }
       if(saved){
       
       res.status(200).json({success:true})  
       } 
    } catch (error) {
        console.log('error from admincontroller block')
    }
}

// const loadCategory = async(req,res) => {
//     try {
//         const category = await Category.find({})
//         res.render('category',{message:"",categories:category})
//     } catch (error) {
//         console.log("error from admincontroller loadcategory",error)
//     }
// }

const loadCategory = async (req, res) => {
    try {

        var search = "";

        if (req.query.search) {
          search = req.query.search;
        }

      let page = parseInt(req.query.page) || 1;
      let limit = 2;
  
      let startIndex = (page - 1) * limit;
  
      let category = await Category.find({$or: [{ name: { $regex: search, $options: "i" } }]}).skip(startIndex).limit(limit);
      let totalDocuments = await Category.countDocuments();
  
      let totalPages = Math.ceil(totalDocuments / limit);
  
      // let categoryData = await Category.find({});
      // console.log(categoryData);
      res.status(200).render("category", {
        message:"",
        categories: category,
        page,
        totalPages,
      });
    } catch (err) {
      console.log(`-- Error at categories -- ${err}`);
    }
  };

const insertCategory = async(req,res) => {
    try {
        const name = req.body.name
        const description = req.body.description
        let page = parseInt(req.query.page) || 1;
        let limit = 2;
  
        let startIndex = (page - 1) * limit;
          let category = await Category.find().skip(startIndex).limit(limit);

        let totalDocuments = await Category.countDocuments();
  
        let totalPages = Math.ceil(totalDocuments / limit);
        // const categoryName = await Category.findOne({name:name})
        const categoryName = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });


        if(categoryName){
            res.render('category',{message:"Category already exists",categories:category,page,totalPages})
        } else {
            const category = new Category({
                name:name,
                description:description
            })
        const saved = await category.save()

            if(saved){
                let page = parseInt(req.query.page) || 1;
                let limit = 2;
          
                let startIndex = (page - 1) * limit;
                  let category = await Category.find().skip(startIndex).limit(limit);
        
                let totalDocuments = await Category.countDocuments();
          
                let totalPages = Math.ceil(totalDocuments / limit);
                res.render('category',{message:"Category added",categories:category,page,totalPages})
            }
        }

    } catch (error) {
        console.log("error form admincontroller insertcategory",error)
    }
}

const deleteCategory = async(req,res) => {
    try {
        const id = req.query.id
        const deletecategory = await Category.updateMany({_id:{$in: id}},{$set: {is_delete:true}},{new:true})
        
        
       res.status(200).json({success:true})  

        
    } catch (error) {
        console.log("error from admincontroller deletecategory",error)
    }
}

const addCategory = async(req,res) => {
    try {
        const id = req.query.id
        const addcategory = await Category.updateMany({_id: {$in:id}},{$set: {is_delete:false}},{new:true})
        
        res.redirect('/admin/category')
        
    } catch (error) {
        console.log("error from admincontroller addcategory")
    }
    
}


const loadEditCategory=async(req,res)=>{
    try {
        
        const id=req.query.id
        const categoryData= await Category.findOne({_id:id})
        console.log(categoryData);
        if(categoryData)
        {
            res.render('editcategory',{edit:categoryData})

        }
        else
        {
            console.log(' not category ');
        }
        
    } catch (error) {
        console.log(('error from category conmtroll load edit user ',error));
    }
}


const editCategory=async(req,res)=>{

    try {
   
        const id=req.query.id
    
        const categoryName = req.body.category_name
        const categoryDescription = req.body.category_description

        const uniqueCategory = await Category.findOne({name:{$regex:categoryName,$options:"i"}})
        const target= await Category.findById(id)
        if(uniqueCategory != target && uniqueCategory != null){
        // const category = await Category.find({})
        let page = parseInt(req.query.page) || 1;
        let limit = 2;
  
        let startIndex = (page - 1) * limit;
        let category = await Category.find().skip(startIndex).limit(limit);

        let totalDocuments = await Category.countDocuments();
  
        let totalPages = Math.ceil(totalDocuments / limit);

            res.render('category',{message:"Category Already Exists",categories:category,page,totalPages})
        }else{

        const categoryEdit = await Category.findByIdAndUpdate(id,{
            name:categoryName,
            description:categoryDescription
            

        },{new:true})
        
        if(categoryEdit)
        {
            res.redirect('/admin/category')

        } else {
        
            res.render('editcategory',{msg:'error from editing '})
        }
        // res.json(categoryEdit)
    }
    } catch (error) {
        
        console.log('error from admin controller edit category',error);
    }
}

// const deleteCategory = async(req,res) => {
//     try {
//         const id = req.query.id
//         await Category.deleteOne({_id:id})
//         res.redirect('/admin/category')
//     } catch (error) {
//         console.log("error from admincontroller deletecategory")
//     }
// }


const loadProducts = async(req,res) => {
    try {

        var search = "";

        if (req.query.search) {
          search = req.query.search;
        }

      let page = parseInt(req.query.page) || 1;
      let limit = 4;
  
      let startIndex = (page - 1) * limit;
  
      let product = await Product.find({  $or: [{ name: { $regex: search, $options: "i" } }]}).sort({arrivalDate: -1 }).skip(startIndex).limit(limit);
      console.log(product,'============products==============');
      let totalDocuments = await Product.countDocuments();
      let totalPages = Math.ceil(totalDocuments / limit);


      
  
    //   let totalstock = products.sizes.reduce((a, size) => (a + size.stock), 0);

   
      res.status(200).render("products", {
        message:"",
        products: product,
        page,
        totalPages
      });


        // const product = await Product.find({})
        // res.render('products',{products:product})
    } catch (error) {
        console.log("error from admincontroller loadproducts")
    }
}


const adminLogout = async(req,res) => {
    try {
        req.session.admin = null
        res.redirect('/admin')
    } catch (error) {
        console.log("error from admincontroller adminlogout")
    }
}


const loadAddProducts = async(req,res) => {
    try {
        const category = await Category.find({})
        res.render('addProduct',{categories:category,message:''})

    } catch (error) {
        console.log("error from admincontroller loadaddproduct")
    }
}

const addProducts = async(req,res) => {
    try {
        const category = await Category.find({})
        if( category !== undefined){
            res.render("products", {
                categories:category,
                message: "Enter the details of product"
            });
        } else {
            console.log("can't fetch category")
            res.redirect('/products')
        }
    } catch (error) {
        console.log("error from admincontroller addproduct",error.message)
    }
}

const insertProduct = async(req,res) => {
    try {
        const{ name, description, price, promoPrice, category, sizes } = req.body
        console.log( name, description, price, promoPrice, category, sizes )

        // check for image uploads
        let imageUrls;
        if(req.files && req.files.length > 0){
            imageUrls = await req.files.map((file) => file.filename)
        }

        console.log("imageUrls",imageUrls)

        const product = await Product.create({
            name,
            description,
            price: parseFloat(price),
            promoPrice: parseFloat(promoPrice),
            category,
            sizes: Object.entries(sizes).map(([size, data]) => ({
                size,
                stock: parseInt(data.stock, 10) || 0
            })),
            images: imageUrls
        })


        const saved = await product.save()

        const  category1 = await Category.find({})

        if(category !== undefined){
            res.render('addProduct', { categories: category1, message:"Product added successfully"})
        } else {
            res.redirect('/products')
        }
    } catch (error) {
        console.log("error from admincontroller insertproducts",error.message)
        res.status(500).json({ error:"Error in adding product"})
    }
}

const deleteProduct = async(req,res) => {
    try {
        const id = req.query.id
        const deleteproduct = await Product.updateOne({_id:id},{$set: {is_delete:true}},{new:true})
        
        
       res.status(200).json({success:true})  

        
    } catch (error) {
        console.log("error from admincontroller deleteproduct",error)
    }
}

const addproduct = async(req,res) => {
    try {
        const id = req.query.id
        const deleteproduct = await Product.updateOne({_id:id},{$set: {is_delete:false}},{new:true})
        
        res.redirect('/admin/products')
        
    } catch (error) {
        console.log("error from admincontroller deleteproduct",error)
    }
}

// const editproduct = async(req,res) =>{
//     try {
//         const id = req.query.id
//         const product = await Product.find({_id:id})
//         console.log(product);
//         const category = await Category.find({})
//         if(product && category){
//         res.render('editproduct',{categories:category,product:product})
//         }
//     } catch (error) {
//         console.log("error from edit product");
//     }
// }


// ================================================================

// // edit product

// const editproduct = async (req, res, next) => {
//     try {
//       // console.log(req.body);
//       const data = await Product.findById(req.query.id);
  
//       const category1 = await Category.find({});
  
//       if (category1 !== undefined) {
//         res.render("editproduct2", {
//           data: data,
//           categories: category1,
//           message: "",
//         });
//       } else {
//         res.redirect("/products");
//       }
//     } catch (error) {
//       console.error("Error adding product:", error);
//       res.status(500).json({ error: "Error adding product" });
//     }
//   };


const editProduct = async(req,res) => {
    try {
        const productlist = await Product.findById(req.query.id)
        const category = await Category.find({})

        res.render('editProduct',{products:productlist,categories:category,message:''})
    } catch (error) {
        console.error("error from edit product")
        res.status(500).json({ error: "Error editing product"});
    }
}




const updateProduct=async(req,res)=>{

    try {
   
       const id=req.query.id
       const {name,description,price,promoPrice,category,sizes}=req.body
       const categories = await Category.find({})


       let image;
       console.log("files addeddddd",req.files);

       if(req.files)
        {
             image=req.files.map(image=>image.filename)
             const updatedProduct = await Product.findByIdAndUpdate(id, {
                $push: { images: image } // Use $push operator for arrays
              }, { new: true }); // Return the updated document
              
            console.log("filesss",req.files);
        }
        else
        {
            console.log("no filesss");
        }
        // editing 
         const productEdit=await Product.findByIdAndUpdate(id,
           { $set:{
            name:name,
            description:description,
            price: parseFloat(price),
            promoPrice: parseFloat(promoPrice),
            category,
            sizes: Object.entries(sizes).map(([size, data]) => ({
                size,
                stock: parseInt(data.stock, 10) || 0
            })),
        
            
            //action:action
            

    }},{new:true})
        
        
        if(productEdit)
        {
            console.log("product edited ");
        res.render('editProduct',{products:productEdit,categories,message:'Updated successfully '})

            // res.redirect('/admin/products')
        }else
        {
            res.render('editProduct',{message:'error from editing '})
            console.log('error from editproduct')
        }
        // res.json(categoryEdit)
    } catch (error) {
        
        console.log('error from product controlle edit category',error);
    }
}
  

const deleteimage=async (req,res)=>{
    try {
      console.log(req.query.index);
      const index=req.query.index
      const id=req.query.id
      const product=await Product.findById(id)
  
      product.images.splice(index, 1);
  
      // 3. Update the product in the database
      await Product.findByIdAndUpdate(id, { images: product.images });
      const url=`http://localhost:3000/admin/editProduct?id=${id}`
    //   res.redirect(url);
      res.status(200).json({success:true})
    } catch (error) {
      console.log("deleteimage error",error);
    }
  }
  
  
  
  
  
//   const updateProduct = async (req, res) => {
//       console.log(req.body);
//       if(req.body.name){
//     try {
//       let updatedImages=[]
//       console.log("Edit Product Body ====================")
//       console.log("bodyil ullath",req.body); // 1. Get Product ID from form data
  
  
//       const id1 = req.body.id; // 2. Get other form data from req.body
//       const id=id1[0]
//       const P_name = req.body.name;
//       const p_description = req.body.description;
//       const p_Aprice = parseFloat(req.body.price);
//       const p_Pprice = parseFloat(req.body.promoPrice);
//       const P_category = req.body.category; // 3. Handle Image Updates (if any) // const p_images = req.files.images.length > 0 //     ? req.files.images.map((file) => file.filename) //     : []; // Handle if no new images are uploaded // 4. Find Category and Stock Data
  
//       const findCategory = await Category.findOne({ _id: P_category });
     
//       // Parse sizes correctly 
//       const sizes = JSON.parse(req.body.sizes['']); 
//       console.log(sizes,"sizes parsed as objects");
      
  
//       const product=await Product.find({_id:id})
//       if (req.files && req.files.length > 0) {
//         var newImageNames = req.files.map((file) => file.filename);
//         console.log("updatedimages",updatedImages);
       
//       }
//       if(newImageNames.length>0){
//       const image =await Product.updateOne(
//         { _id: id }, 
//         { $push: { images: { $each: [...newImageNames] } } }
//      )
//     }
      
//       console.log("image urlss : ", updatedImages);
  
      
//       // 5. Update Product in Database (Atomic Update with $set)
  
//       const updatedProduct = await Product.findByIdAndUpdate(
//         id,
//         {
//           $set: {
//             name: P_name,
//             description: p_description,
//             price: p_Aprice,
//             promoPrice: p_Pprice,
//             category: findCategory._id, // images: p_images, // Update only if new images are uploaded
//             sizes: sizes
  
//           },
//         },
//         { new: true }
//       ); // Get the updated product document // 6. Error Handling
  
//       if (!updatedProduct) {
//         return res.status(404).json({ error: "Product not found" });
//       } // 7. Send Success Response
  
//       res.json({ updated: true, product: updatedProduct });
//     }
//   catch (error) {
//       console.error("Error from product controller updateProduct:", error);
//       res
//         .status(500)
//         .json({ error: "An error occurred while updating the product" });
//     }}
//     else{
//       console.log("errorrr");
//       res.redirect('/admin')
//     }
//   };



const loadOrders = async(req,res)=>{
    try {
        var search = "";

        if (req.query.search) {
          search = req.query.search;
        }

        let id = req.session.id

      let page = parseInt(req.query.page) || 1;
      let limit = 4;
  
      let startIndex = (page - 1) * limit;
  
      let orders = await Order.find({}).populate('userId').sort({date:-1}).skip(startIndex).limit(limit);
      let totalDocuments = await Order.countDocuments();
  
      let totalPages = Math.ceil(totalDocuments / limit);

    //   let list = await Cart.findOne({userId:id}).populate('products.productId')

        // const orders = await Order.find({}).populate('userId')
        res.render('orderList',{orders,page,totalPages})
    } catch (error) {
        console.log("error from admin controller load orders",error);
    }
}


const cancelOrder = async(req,res) => {
    try {
        const {id} = req.query
        const orderData = await Order.findByIdAndUpdate(id, {$set:{"products.orderStatus":'cancelled'}},{new:true})
        console.log(orderData);

        if(orderData){
            res.status(200).json({success:true})
        }
    } catch (error) {
        console.log("error from admincontroller cancel orders",error);        
    }
}


const loadOrderDetails = async(req,res) => {
    try {
        const { id } = req.query;

        const order = await Order.findById(id).populate('products.productId').populate('userId');
        const addressId = order.addressId.toString()
        const address = await Address.findOne({userId:order.userId})
        const match = address.address.find(address => address._id.equals(addressId))

        if(!order) {
            return res.status(404).send('Order not found')
        }
        try {
            res.render('orderDetails',{order,address:match})
            
        } catch (err) {
            console.error('Error fetching load order details',err)
        }
    } catch (error) {
        res.status(500).send('Internal Server Error')
        console.log("error from admincontroller loadOrderDetails",error);
    }
}


const statusChange = async(req,res) => {
    try {
    const orderId = req.query.id;
    const newStatus = req.body.status;
    const order = await Order.findById(orderId).populate('userId')

    // Input Validation (important for security)
    if (!orderId || !newStatus) {
      return res.status(400).json({ error: 'Missing order ID or new status.' });
    }

    if (!['Pending', 'Delivered', 'Cancelled',"Return","Shipped","Return pending","Return cancelled","Return completed","Payment failed"].includes(newStatus)) {
      return res.status(400).json({ error: 'Invalid order status.' });
    }

    // Update Order in Database
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { $set: { orderStatus: newStatus } },
      { new: true } // Return the updated document
    );

    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    if(newStatus == 'Delivered'){
        // Update Order in Database
    const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        { $set: { payment_status: 'Success' } },
        { new: true } // Return the updated document
      );
    }else if(newStatus=='Cancelled' && order.payment_status == 'Success'){
        // Update Order in Database
    const updatedOrder = await User.findByIdAndUpdate(
        order.userId._id,
        { $set: { wallet: order.totalAmount } },
        { new: true } // Return the updated document
      );
    }
    // Optional: Trigger any necessary actions based on the new status
    // For example, send email notifications, update inventory, etc.
    // ... your logic here ...

    res.json({ success: true, updatedOrder });
    } catch (error) {
        console.log("error from admin controller status change");
        res.status(500).json({error: 'Internal server error'});
    }
}



// Route to display the coupon creation form (GET /coupons/new)
const loadCoupon = async(req, res) => {
    try {

        var search = "";

        if (req.query.search) {
          search = req.query.search;
        }
        
        const coupons = await Coupon.find({$or: [{ code: { $regex: search, $options: "i" } }]})
        res.render('couponList',{message:'',coupons}); // Replace with your EJS template name
    } catch (error) {
        console.log("error from admincontroller load coupon");
    }
}

// Route to handle coupon creation form submission (POST /coupons)
const createCoupon = async (req,res)=>{
  const { code, discountType, discountValue, isActive, startDate, endDate, minimumOrderAmount, description, products, categories } = req.body;

  // Basic validation (consider using a validation library like Joi for more complex validation)
  if (!code || code.length < 5) {
    return res.status(400).render('coupon', { message: 'Coupon code must be at least 5 characters long' });
  }

  // Convert product and category strings to arrays (if provided)
  const productIds = products ? products.split(',').map(id => id.trim()) : [];
  const categoryList = categories ? categories.split(',').map(cat => cat.trim()) : [];

  try {
    console.log("create coupon try");
    // Create a new coupon document
    const newCoupon = new Coupon({
      code,
      discountType,
      discountValue,
      isActive: isActive === 'on', // Handle checkbox value conversion
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      minimumOrderAmount,
      description,
      products: productIds,
      categories: categoryList
    });
console.log("create coupon save");
    // Save the new coupon and handle errors
    await newCoupon.save();
    return res.status(200).json({success:true});
    // res.redirect('/admin/coupon');
     // Redirect to coupon list page (replace with your desired redirect)
  } catch (error) {
    console.error(error);
    res.status(500).render('coupon', { message: 'Error creating coupon' });
  }
}


const deleteCoupon = async (req,res) => {
    try {
        const id = req.query.id
        console.log("coupon ethi");
        const updated = await Coupon.deleteOne({_id:id})
        if(updated){
        res.status(200).json({success:true})
        }
    } catch (error) {
        console.log("error from admin controller delete coupon",error);
    }
}


const loadStatics=async(req,res)=>{
    try {
  
  
      const bestProduct = await Order.aggregate([
        { $unwind: '$products' },
        { 
            $group: {
                _id: '$products.productId',
                totalQuantity: { $sum: '$products.quantity' },
                totalSales: { $sum: { $multiply: ['$products.quantity', '$products.price'] } }
            }
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 10 },
        {
            $lookup: {
                from: 'products',
                localField: '_id',
                foreignField: '_id',
                as: 'productDetails'
            }
        },
        { $unwind: '$productDetails' },
        {
            $project: {
                _id: 1,
                totalQuantity: 1,
                totalSales: 1,
                'productDetails.name': 1,
                'productDetails.price': 1,
                'productDetails.images': 1
            }
        }
    ]);
    // console.log("orders",orders);
  
  
  
//     const bestCategory = await Order.aggregate([
//       { $unwind: '$products' },
//       {
//           $lookup: {
//               from: 'products',
//               localField: 'products.productId',
//               foreignField: '_id',
//               as: 'productDetails'
//           }
//       },
//       { $unwind: '$productDetails' },
//       {
//           $group: {
//               _id: '$productDetails.category',
//               totalQuantity: { $sum: '$products.quantity' },
//               totalSales: { $sum: { $multiply: ['$products.quantity', '$products.price'] } }
//           }
//       },
//       { $sort: { totalQuantity: -1 } },
//       { $limit: 10 },
//       {
//           $lookup: {
//               from: 'Category',
//               localField: '_id',
//               foreignField: '_id',
//               as: 'categoryDetails'
//           }
//       },
//       { $unwind: '$categoryDetails' },
//       {
//           $project: {
//               _id: 1,
//               totalQuantity: 1,
//               totalSales: 1,
//               'categoryDetails.name': 1,
//               'categoryDetails.description': 1
//           }
//       }
//   ]);
const bestCategory = await Order.aggregate([
    { $unwind: '$products' },
    {
      $lookup: {
        from: 'products',
        localField: 'products.productId',
        foreignField: '_id',
        as: 'productDetails'
      }
    },
    { $unwind: '$productDetails' },
    {
      $group: {
        _id: '$productDetails.category',
        totalQuantity: { $sum: '$products.quantity' },
        totalSales: { $sum: { $multiply: ['$products.quantity', '$products.price'] } }
      }
    },
    { $sort: { totalQuantity: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: '_id',
        as: 'categoryDetails'
      }
    },
    { $unwind: '$categoryDetails' },
    {
      $project: {
        _id: 1,
        totalQuantity: 1,
        totalSales: 1,
        'categoryDetails.name': 1,
        // 'categoryDetails.description': 1
      }
    }
  ]);
  
//   console.log(bestCategory);
  

  console.log("best produvt ",bestProduct);
  console.log("best category ",bestCategory,"============");
  
//   res.status(200).json({success:true});
  
  
      res.render('salesreport',{product:bestProduct,category:bestCategory})
      
    } catch (error) {
      
      console.log("error form admincontroller loadStatics",error);
    }
  }


  const loadCreateCoupon= async (req,res)=>{
try {
    res.render('coupon')
} catch (error) {
    console.log("load create coupon");
}

}
function getStartDate(interval) {
    // Get the current date
    const currentDate = new Date();

    // Initialize variables to store start date
    let startDate;

    // Determine the start date based on the selected interval
    switch (interval) {
        case 'yearly':
            startDate = new Date(currentDate.getFullYear(), 0, 1); // First day of the current year
            break;
        case 'monthly':
            startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1); // First day of the current month
            break;
        case 'weekly':
        default:
            // Calculate the start date for the beginning of the current week (Sunday)
            const firstDayOfWeek = currentDate.getDate() - currentDate.getDay();
            startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), firstDayOfWeek);
            break;
    }
console.log(startDate);
    return startDate;
}



const getOrdersGraphData = async (req, res) => {
    try {
      const interval = req.query.interval || 'monthly';
      const startDate = getStartDate(interval);
  
     
      let groupId;
      let dateFormat;
  
      switch (interval) {
          case 'yearly':
              groupId = { year: { $year: '$date' } };
              dateFormat = { $concat: [{ $toString: "$_id.year" }] };
              break;
          case 'monthly':
              groupId = { month: { $month: '$date' }, year: { $year: '$date' } };
              dateFormat = {
                  $concat: [
                      { $toString: "$_id.month" },
                      "/",
                      { $toString: "$_id.year" }
                  ]
              };
              break;
          case 'weekly':
          default:
              groupId = { day: { $dayOfMonth: '$date' }, month: { $month: '$date' }, year: { $year: '$date' } };
              dateFormat = {
                  $concat: [
                      { $toString: "$_id.day" },
                      "/",
                      { $toString: "$_id.month" },
                      "/",
                      { $toString: "$_id.year" }
                  ]
              };
              break;
      }
  
      console.log("group id", groupId);
      console.log("date format", dateFormat);
  
      
          const orders = await Order.aggregate([
            //   { $unwind: "$products" },
              { $match: { "date": { $gte: startDate } } },
              {
                  $group: {
                      _id: groupId,
                      totalOrders: { $sum: 1 }
                  }
              },
              {
                  $addFields: {
                      date: dateFormat
                  }
              },
              {
                  $project: {
                      _id: 0,
                      date: 1,
                      totalOrders: 1
                  }
              },
              { $sort: { 'date': 1 } }
          ]);
  
          const labels = orders.map(order => order.date);
          const values = orders.map(order => order.totalOrders);
  
          console.log("labels: ", labels);  // Debugging log
          console.log("values: ", values);  // Debugging log
  
  
          
     res.json({ labels, values });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
  };



  const pdfDownloadOrders = async (req, res) => {
    try {
        const { startDate, endDate, predefinedRange } = req.query;
        let start, end;

        // Determine the date range
        if (predefinedRange) {
            switch (predefinedRange) {
                case 'oneDay':
                    start = new Date();
                    start.setDate(start.getDate() - 1);
                    end = new Date();
                    break;
                case 'oneWeek':
                    start = new Date();
                    start.setDate(start.getDate() - 7);
                    end = new Date();
                    break;
                case 'oneMonth':
                    start = new Date();
                    start.setMonth(start.getMonth() - 1);
                    end = new Date();
                    break;
                case 'oneYear':
                    start = new Date();
                    start.setFullYear(start.getFullYear() - 1);
                    end = new Date();
                    break;
                default:
                    throw new Error('Invalid predefined range');
            }
        } else {
            if (startDate) {
                start = new Date(startDate);
            }
            if (endDate) {
                end = new Date(endDate);
            }
        }

        // Query to fetch orders based on date range
        const query = {};
        if (start && end) {
            query.date = { $gte: start, $lte: end };
        }

        const orders = await Order.find(query)
            .populate('userId')
            .populate('addressId')
            .populate('products.productId'); // Populate product details

        // Create a PDF document
        const doc = new PDFDocument({ margin: 50 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=orders_report.pdf');

        // Pipe the PDF into the response
        doc.pipe(res);

        // Add Header
        doc.fontSize(20).text('Orders Report', { align: 'center' });
        doc.fontSize(12).text(`Date: ${new Date().toISOString().split('T')[0]}`, { align: 'center' });
        doc.moveDown();

        // Add table header
        doc.fontSize(10);
        doc.fillColor('#444444');
        doc.text('Order ID', 50, 100, { bold: true });
        doc.text('User', 100, 100, { bold: true });
        doc.text('Date', 200, 100, { bold: true });
        doc.text('Total Amount', 300, 100, { bold: true });
        doc.text('Status', 400, 100, { bold: true });
        doc.text('Products', 500, 100, { bold: true });
        doc.moveTo(50, 120).lineTo(550, 120).stroke();
        let y = 130;

        // Add orders data
        orders.forEach(order => {
            if (y > 750) { // Check for page overflow
                doc.addPage();
                y = 50;
            }

            doc.fillColor('#000000');
            doc.text(order.orderId, 50, y);
            doc.text(order.userId.name, 100, y);
            doc.text(order.date.toISOString().split('T')[0], 200, y);
            doc.text(`Rs ${order.totalAmount}`, 300, y);
            doc.text(order.orderStatus, 400, y);

            // List products
            let productsText = order.products.map(product => `${product.productId.name} `).join(', ');
            doc.text(productsText, 500, y, { width: 200 });

            y += 20;

            if (order.addressId) {
                const address = order.addressId.address[0];
                doc.text(`Address: ${address.name}, ${address.street}, ${address.city}, ${address.state}, ${address.country}`, { indent: 50, width: 500 });
                doc.text(`Pincode: ${address.pincode}`, { indent: 50, width: 500 });
                doc.text(`Mobile No: ${address.mobile}`, { indent: 50, width: 500 });
                y += 40;
            }
        });

        // Add Footer
        doc.moveTo(50, 750).lineTo(550, 750).stroke();
        doc.fontSize(10).text('Generated by Ecommerce System', 50, 760, { align: 'center' });

        // Finalize the PDF and end the stream
        doc.end();

    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('Internal Server Error');
    }
};



module.exports = {
    loadLogin,
    verifyLogin,
    loadHome,
    loadUserslist,
    unblock,
    block,
    loadCategory,
    insertCategory,
    adminLogout,
    deleteCategory,
    addCategory,
    loadEditCategory,
    editCategory,
    loadProducts,
    loadAddProducts,
    addProducts,
    insertProduct,
    deleteProduct,
    addproduct,
    // editproduct,
    updateProduct,
    editProduct,
    deleteimage,
    loadOrders,
    cancelOrder,
    loadOrderDetails,
    statusChange,
    loadCoupon,
    createCoupon,
    deleteCoupon,
    loadStatics,
    loadCreateCoupon,
    getOrdersGraphData,
    pdfDownloadOrders
    

}



