const express= require('express')
const path = require('path')
require('dotenv').config()
const bodyparser = require('body-parser')
const app = express()
const processor =require('./processor')
app.use(bodyparser.urlencoded({extended:true}))
app.use(bodyparser.json())
app.use(express.static(path.join(__dirname,'static')))

app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,'static','main','index.html'))
})
app.get('/getapps',processor.getApps)
app.get('/getapp',processor.getApp)
app.post('/login',processor.login)
app.post('/signup',processor.signup)
app.post('/savedata',processor.savedata)
app.get('/loaddata',processor.loaddata)
app.post('/initapp',processor.initapp)
app.post('/saveapp',processor.saveapp)
app.get('/loadapps',processor.loadapps)
app.post('/saveapps',processor.saveapps)
app.listen(process.env.PORT,()=>{
    console.log('we are live on 2000')
})