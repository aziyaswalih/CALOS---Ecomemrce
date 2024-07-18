const User = require('../models/userModel')
const Product = require('../models/productModel')
const Cart = require('../models/cartModel')
const Address = require('../models/addressModel')

const loadCart = async(req,res)=>{
    try {
       
        let name=""
        if(req.session.user)
            {
                name=req.session.user.name
            }
        const uid=req.session.user._id
        // const product = await Product.findById(id)


        // const user = await User.findById(uid)
        let cart=await Cart.findOne({userId:uid}).populate('products.productId')
        if(cart)
            {
                console.log("cart ",cart);
               
            }

            res.render('cart',{cart:cart,user:name})
         
            
    } catch (error) {
        console.log("error from userscontroller loadcart")
    }
}


const addtoCart=async(req,res) => {
    try {
        console.log("add cart rendering");
        // const productId=req.query.id

        const {productId,qty,selectedSize}=req.body
        console.log("body",productId,qty,selectedSize);
        console.log("productId",productId);
        const userId=req.session.user._id
        console.log("user",userId);
        const product = await Product.findById(productId)
       let cart = await Cart.findOne({userId:userId})
        const totalprice=parseInt(product.promoPrice*qty)
        if(!cart){
            console.log("new cart");
            // let cartTotal = cart.products.reduce((total, product) => total + product.price, 0);
            // console.log("carttotsal", cartTotal);
            

           cart = new Cart({
                userId:userId,
                products:[{productId:productId,quantity:qty,size:selectedSize,price:totalprice}],
                total:totalprice


            })
            console.log("new cart end");
        }else{
            console.log("existing cart ");
            const existingproductIndex = cart.products.findIndex(product => product.productId.equals(productId)&& product.size == selectedSize)
            console.log(" exist",existingproductIndex);
            if(existingproductIndex >= 0){
                // if(size==cart.products[existingproductIndex].size){
                console.log("existing product");
                
                cart.products[existingproductIndex].quantity += parseInt(qty)

                let quantity=cart.products[existingproductIndex].quantity
                console.log("quantity ",quantity);
                cart.products[existingproductIndex].price+=totalprice
                console.log("new cart");
                let cartTotal = cart.products.reduce((total, product) => total + product.price, 0);
                console.log("carttotsal", cartTotal);




                cart.total=cartTotal
                

            } else {
                
                
                console.log("existing new product");
               
                cart.products.push({productId,quantity:qty, size:selectedSize,price:totalprice})


                console.log("new cart");
            let cartTotal = cart.products.reduce((total, product) => total + product.price, 0);
            console.log("carttotsal", cartTotal);

                cart.total = cartTotal
            }
          
            
        }
        const saving= await cart.save();
        if(saving){
         console.log("savedd");
         res.status(200).json({success:true }).redirect('/product/cart');

        //  res.redirect('/product/cart')

        }else
        {
         console.log("not saved");
        }



        
    } catch (error) {
        console.log("error from add to cart",error)

    }
}

const deleteCart = async(req,res) => {
    try {
        const id = req.query.id
        const user = req.session.user._id
        const cart=   await Cart.findOne({userId:user})
   
     if(cart){
        const productToDelete = cart.products.find(product => product._id.equals(id));
        const total=cart.total-productToDelete.price
        if (productToDelete) {
        // Remove the product from the cart's products array
        const updatedProducts = cart.products.filter(product => !product._id.equals(id));
        cart.products = updatedProducts;
        cart.total = total

        // Optionally, save the updated cart to the database
        await cart.save();
        } else {
        console.error(`Product with ID ${id} not found in cart`);
        }

     }
    
       res.status(200).json({success:true})  

    } catch (error) {
        console.log("error from cartcontroller deletecart")
    }
}


const quantityUpdate = async (req, res) => {
    try {
      console.log("cart qty");
      let { selectedSize, productId, status } = req.body;
      console.log(selectedSize, productId, status);
      let productData = await Product.findById(productId);
      let cartData = await Cart.findOne({ userId: req.session.user._id });
      if (status === "UP") {
        console.log(`status is ${status}`);
        const productIndex = cartData.products.findIndex(
          (item) =>
            item.productId.toString() === productId && item.size === selectedSize
        );
        const findProductStock = productData.sizes[selectedSize];
        console.log(findProductStock)
        console.log(productIndex);
        if (productIndex > -1) {
          if(cartData.products[productIndex].quantity < findProductStock) {
            if (
              cartData.products[productIndex].quantity >= 1 &&
              cartData.products[productIndex].quantity < 10
            ) {
              cartData.products[productIndex].quantity += 1;
              // cartData.product[productIndex].productPrice =
              //   productData.promo_price;
            } else {
              console.log("quantity out of range");
              return res.json({
                message: "Max 10",
                total: cartData.total,
              });
            }
          } else {
            return res.json({
              message: "product exceeded",
              total: cartData.total,
            })
          }
        }
  
        cartData.total = cartData.products.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
  
        let total = cartData.total;
        await cartData.save();
        res
          .status(200)
          .json({
            message: "quantity updated successfully",
            total: total,
            products: cartData.products,
          });
      } else if (status === "DOWN") {
        console.log(`status is ${status}`);
        const productIndex = cartData.products.findIndex(
          (item) =>
            item.productId.toString() === productId && item.size === selectedSize
        );
        console.log(productIndex);
        if (productIndex > -1) {
          if (
            cartData.products[productIndex].quantity > 1 &&
            cartData.products[productIndex].quantity <= 10
          ) {
            cartData.products[productIndex].quantity -= 1;
            // cartData.product[productIndex].productPrice -=
            //   productData.promo_price;
          } else {
            console.log("quantity out of range");
            return res.json({
              message: "Min 1", 
              total: cartData.total,
            });
          }
        }
  
        cartData.total = cartData.products.price.reduce(
          (total, item) => total + item.promoPrice * item.quantity,
          0
        );
        let total = cartData.total;
        await cartData.save();
        res
          .status(200)
          .json({ message: "quantity updated successfully", total: total });
      }
    } catch (error) {
      console.log(`Error in quantityUpdate -- ${error}`);
    }
  };


  const changeQuantity=async(req,res)=>{
    try {
        // ===============================================
            const id=req.session?.user?._id?req.session.user._id:req.session?.passport?.user?._id
            const cart= await Cart.findById({_id:req.body.id}).populate('products.productId')
            const quantities=req.body.quantities
            let updated=null;
            if(quantities.length>0){
            quantities.forEach((quantity, index) => {
                if (quantity > 0) {
                  cart.products[index].quantity = quantity;
                }
            })
            
            cart.total = cart.products.reduce((sum, product) => {
                product.price=product.quantity * product.productId.promoPrice
                console.log(product.quantity, product.productId.promoPrice);
                return sum + product.quantity * product.productId.promoPrice;
              }, 0);
          
              // Save the updated cart
             updated= await cart.save();
            }
            if(updated){
            return res.status(200).json({success:true})
            }


    } catch (error) {
        
        console.log("error from cartController ChangeQuantity",error);
    }
}


const availableStock = async(req,res) => {
  try {
    console.log('available stock');
    const {id,size} = req.query
    console.log(id,size,"========size & id========");
    const product = await Product.findById(id)
    const stock = product.sizes.find(sizes=> sizes.size == size)
    console.log(stock,"asdfg");
    if(stock.stock){
      return res.status(200).json({stock:stock.stock})
    }
  } catch (error) {
    console.log("error from cart controller available stock",error);
  }
}

module.exports={
    loadCart,
    addtoCart,
    deleteCart,
    quantityUpdate,
    changeQuantity,
    availableStock
  

}