const isLogin = async(req,res,next) => {
    try {
        if(req.session.admin){
            
            next()
        } else {
            res.redirect('/admin')
        }
    } catch (error) {
        console.log("error from adminauth islogin")
    }
}

const isLogout = async(req,res,next) => {
    try {
        if(req.session.admin){
            res.redirect('/admin/home')
        } else {
            next()
        }
    } catch (error) {
        console.log("error from adminauth islogout")
    }
}

module.exports ={
    isLogin,
    isLogout
}