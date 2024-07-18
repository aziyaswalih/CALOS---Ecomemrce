const User = require("../models/userModel")

const isLogin = async(req,res,next) => {
    try {

        if(req.session.user){
            console.log("session ",req.session.user._id);
            if(!req.session.user.is_block){
                console.log("session ",req.session.user);
            // var userData=await User.findById({_id:req.session.user._id})
           
            next()
            }
            else{
            //  userData=await User.findById({_id:req.session.passport.user._id})
            req.session.destroy()
            res.render('login',{message:"You are blocked",message1:''})

            }
            
            // if(userData.is_block){
            // }
            // else{
            // next()
            // }
        } else {
            console.log("NO SESSION");
            res.redirect('/login')
        }
    } catch (error) {
        console.log("error from userauth islogin",error)
    }
}



const isLogout = async(req,res,next) => {
    try {
        if(req.session.user){
            console.log("sEESION",req.session.user);
            res.redirect('/home')
        } else {
            next()
        }
    } catch (error) {
        console.log("error from userauth islogout",error)
    }
}

module.exports ={
    isLogin,
    isLogout
    // isLogin1
}