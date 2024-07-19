const express = require('express')
const app = express()
const session = require('express-session')
const path = require('path')
const bodyParser = require('body-parser')
require('dotenv').config()
const PORT = process.env.PORT || 3000

const mongoose = require('mongoose')
mongoose.connect(process.env.MONGODB)
.then(() => {
    console.log('connected to mongodb') 
})
.catch((err)=>{
    console.log(err)
}) 

app.use(session({
    secret:'secret',
    resave:false,
    saveUninitialized:true
}))



// routes
const userRoute = require('./routes/userRoute')
const adminRoute = require('./routes/adminRoute')

app.set('views',path.join(__dirname,'views'))
app.set('view engine','ejs')

// body parser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// set static folder
app.use(express.static(path.join(__dirname,'public')))

app.use('/',userRoute) 
app.use('/admin',adminRoute)

app.listen(PORT, ()=>console.log(`App is listening on port ${PORT}`));