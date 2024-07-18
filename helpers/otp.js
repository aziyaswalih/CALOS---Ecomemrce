// const generateOtp = require('generate-otp')
const nodemailer = require('nodemailer');
const User = require('../models/userModel');
require('dotenv').config()



const generate = () => {
    return Math.floor(1000 + Math.random() * 9000); // for 4 digit otp
}


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_ADDRESS,
        pass: process.env.GMAIL_APP_PASSWORD
    }
})


const sendOTP = async(userEmail,otp) => {
    try {
        const mail = {
            from:"aziyahafees@gmail.com",
            to:userEmail,
            subject: 'OTP Verification',
            text: `Your OTP code is: ${otp}`
        }

        await transporter.sendMail(mail)
    } catch (error) {
        
    }
}

const verify = async(req,res) => {
    try{
        
    // const userEmail = req.session.user.email
    const userEmail = req.session.temp.email

    const storedOtp = generate();
    console.log(userEmail,storedOtp);

    // req.session.user.otp = storedOtp
    req.session.temp.otp = storedOtp
    console.log(req.session.temp.otp,"sessionil otp add aayi");
    await sendOTP(userEmail,storedOtp);
    req.session.temp.createdAt=new Date();
    if(req.session?.temp?.expired){
        req.session.temp.expired = false
        res.render('verify',{email:req.session.temp.email,message:"OTP expired"})
    }else{
    res.render('verify',{email:req.session.temp.email,message:""})
    }
    } catch (error) {
        console.log("error from helpers otp verify",error)
    }
}

const verified = async(req,res) => {
    try {
        console.log("body",req.body,"session otp",req.session.temp.otp);
        if(req.body.otp){
            // const otp = req.body.one+req.body.two+req.body.three+req.body.four
            const otp = req.body.otp
   
            if(req.session.temp.otp == otp){
                const dif=(new Date()- new Date(req.session.temp.createdAt))/1000;
                if(dif<=30){
                console.log("if conditionn");
                console.log(req.session.temp)
                // const updatedUser = await User.findOne(req.session.temp.email, {$set: {is_verified: true}});
                // const updatedUser = await User.insertOne(req.session.temp)
                // updatedUser.save()
                // console.log(updatedUser);
                const newUser = new User(req.session.temp); // Create a new instance of the User model with the data
                await newUser.save(); // Save the new user instance to the database
                console.log(newUser); // Log the saved user document

                if(newUser){
                    console.log("redirect to home page")
                    await User.findByIdAndUpdate(newUser._id, {$set: {is_verified: true}})
                    req.session.user = newUser;
                    res.redirect('/home')
                }}else{
                    req.session.temp.expired=true
                    console.log("redirect to verify page")
                res.redirect('/verify')

                }
            } else {
                res.render('verify', {email:req.session.temp.email,message:"Incorrect OTP"})
            }
        } else {
            res.render('verify',{email:req.session.temp.email,message:null})
        }
    } catch (error) {
        console.log("error from helpers otp verified")
    }
}

module.exports = {
    verify,
    verified
}
