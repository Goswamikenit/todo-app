const mongoose = require('mongoose')


const todoSchema = new mongoose.Schema({
    description:{
        type:String,
        required: true
    },
    status:{
        type:String
    },
    image:{
        type: String
    }

})

module.exports = new mongoose.model('Todo', todoSchema)