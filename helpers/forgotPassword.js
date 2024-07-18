const nodemailer = require('nodemailer')
require('dotenv').config()

const sendresetPasswordMail=(username,email,token)=>{
    return new Promise(async (resolve,reject)=>{
        const transporter=nodemailer.createTransport({
            service:'gmail',
            auth:
            {
                user:process.env.GMAIL_ADDRESS,
                pass:process.env.GMAIL_APP_PASSWORD
            }
            
        })
        const mailOPtion={
            from:process.env.GMAIL_ADDRESS,
            to:email,
            subject:'reset password',
            html:'<p> Hai '+username+'Please Click the  link <a href="https://calosonline.shop/resetPassword?token='+token+'">and reset your password</a></p>'
        
        }
        console.log(`https://calosonline.shop/resetPassword?token=${token}`);

        await transporter.sendMail(mailOPtion,(err,info)=>{
            if(err)
            {
                    console.log('error from helper > forgot > sendmail',err.message)
                    reject(err)
            }else
        
            {
                console.log('Email sent :'+ info.response);
                resolve(info)
            }
         })
        
        })
        }
      


module.exports={
    sendresetPasswordMail
}