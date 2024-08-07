const bodyParser = require('body-parser')
const express = require('express')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
mongoose.connect('mongodb://localhost/todo_express', {useNewUrlParser: true, useUnifiedTopology:true})
const path = require('path')

const app = express()


app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())

app.use(express.urlencoded({extended:true}))
app.use(express.static('public'))
app.use('/uploads', express.static(path.join(__dirname,'uploads')))



app.use(methodOverride('_method'))
app.set("view engine","ejs")

app.use(require('./routes/index'))
app.use(require('./routes/todo'))



app.listen(1001,(req,res)=>{
    
})