const express = require('express')
const app = express()
const session = require('express-session')


const passport=require('passport')
require('dotenv').config()
const User=require('../models/userModel')

app.use(session({
    secret:'secret',
    resave:false,
    saveUninitialized:true
}))

const GoogleStrategy=require('passport-google-oauth2').Strategy
// const facebookLink=require('passport-facebook').Strategy


// used to serialize the user for the session
passport.serializeUser(function(user,done)
{
    done(null,user)
})

// used to deserialize the user
// used to deserialize the user
passport.deserializeUser(function(user, done) {
    if (!user) {
        return done(new Error('User not found'));
    }
    done(null, user);
});



// google linking
passport.use(new GoogleStrategy({ 
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:"http://localhost:3000/auth/google/callback",
    // profileFields:['id', 'displayName', 'name', 'gender', 'picture.type(large)','email'],
    passReqToCallback: true


},
async function(request,accessToken, refreshToken, profile, done) {
         try {
            // To check existing user
             let user = await User.findOne({ email:profile.emails[0].value}).exec()
             
             
            
             if (!user) {
                 user = await User.create({
                     googleId: profile.id,
                     email: profile.emails[0].value, // Assuming email is provided from Google profile
                     name: profile.displayName, // Assuming username is provided from Google profile
                     is_block: false,
                     is_verified:true, // Assuming isBlocked is optional and default value is false
                     password: "", // Assuming password is optional and empty string
                     mobile: "", // Assuming mobile is optional and empty string
                       
                 }); 
             }
             
             
            console.log(request.session,"session details");
             return done(null, user);
         } catch (err) {
            return done(err);
   
         }
        }
));


// const profilePage=  function(req, res) {
//     res.render('profile', { user: req.user });
// }