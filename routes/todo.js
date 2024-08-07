const express = require('express');
const csv = require('csv-parser');
const fs = require('fs');
const { Parser } = require('json2csv');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });


const todo = require('../models/todo')


const router= require('express').Router()
const Todo = require('../models/todo')

const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'uploads/')
    },
    filename:(req,file,cb)=>{
        cb(null,Date.now() + '-' + file.originalname)
    }
})
const picUpload = multer({storage:storage});
  

router.get('/', async (req,res)=>{
    try
    {
        const allTodo = await Todo.find()
        res.render('index', {todo:allTodo})
    }catch(err){
        console.log(err)
        res.status(500).send('Failed to fetch Todos')
    }
    
})

router.post('/add/todo', picUpload.single('image'), (req,res)=>{
    const {description,status} = req.body
    const newTodo = new Todo({
        description,
        status,
        image: req.file ? req.file.path.replace(/\\/g,'/'): null
    })


    newTodo.save()
    .then(()=>{
        console.log("Task Added")
        res.redirect('/')
    })
    .catch((err)=> console.log(err))
})

router.post('/update/todo/:id',picUpload.single('image'), async(req,res)=>{
    try{
        const {status} = req.body;
        const updateData = {status}
        if(req.file){
            updateData.image = req.file.path.replace(/\\/g,'/')
        }
        // console.log('Updating task ID: ',req.params.id, 'with status: ')
        await Todo.findByIdAndUpdate(req.params.id,updateData)
        res.redirect('/')
    }catch(err){
        console.log(err)
        res.status(500).send('Failed to Update Task ')
    }
})  

router.get('/delete/todo/:id', async(req,res)=>{
   try{
    const {id} = req.params
    await Todo.findByIdAndDelete(id)
    // console.log('Task Deleted')
    res.redirect('/')

   }catch(err){
    console.log(err)
    res.status(500).send('Failed  to delete task')
   }
})
router.post('/todos/upload', upload.single('file'), (req, res) => {
    const filePath = req.file.path;
    const todos = [];
    const validStatuses = ['pending', 'completed'];

    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
            if (row.description && validStatuses.includes(row.status)) {
                todos.push({
                    description: row.description,
                    status: row.status
                });
            } else {
                console.log(`Invalid row: ${JSON.stringify(row)}`);
            }
        })
        .on('end', async () => {
            try {
                console.log(`Parsed todos: ${JSON.stringify(todos)}`);
                await Todo.insertMany(todos);
                fs.unlinkSync(filePath); 
                res.redirect('/');
            } catch (err) {
                console.error('Failed to insert todos:', err);
                res.status(500).send('Failed to upload Todos');
            }
        })
        .on('error', (err) => {
            console.error('Error reading CSV file:', err);
            res.status(500).send('Failed to process CSV file');
        });
});

router.get('/todos/download', async(req,res)=>{
    try{
        const todos = await Todo.find()
        const fields = ['description', 'status']
        const json2csvParser =  new Parser({fields})
        const csv = json2csvParser.parse(todos)

        res.header('Content-Type', 'text/csv')
        res.attachment('todos.csv')
        res.send(csv)
    }catch(err){
        res.status(500).send('Download failed!!')
    }
})

router.get('/todos/filter', async(req,res)=>{
    try{
        const {status} = req.query
        const filter = status && status !== 'all' ? {status} : {}
        const todos = await Todo.find(filter)
        res.render('index', {todo:todos})
    }catch(err){
        console.error('Failed to filter Todos', err)
        res.status(500).send('Failed to filter Todos')
    }
})

module.exports = router