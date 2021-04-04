const path = require('path')
const fs= require('fs')
const db = require('./db')

const getApps =(req,res)=>{
    fs.readFile(path.join(__dirname,'apps.json'),'UTF-8',(err,data)=>{
        res.send(data)
    })
}
const getApp =(req,res)=>{
    let appid = req.query.appid
    fs.readFile(path.join(__dirname,'apps.json'),'UTF-8',(err,data)=>{
        data = JSON.parse(data)
        res.send(data[appid])
    })
}
const signup =(req,res)=>{
    let email = req.body.email
    let password = req.body.password
    let username = req.body.username
    db.getDb().collection('users').findOne({'email':email},(err,result)=>{
        if(result && result.length){
            res.send({'status':0})
        }
        else {
            db.getDb().collection('users').insertOne({
                'email': email,
                'password': password,
                'username': username,
                'main': {
                    'appdata': {},
                    'apps': {},
                    'executors': {}
                },
                'driveA':{}
            })
            res.send({'status': 1})
        }
    })
}

const login = (req,res)=>{
    let email = req.body.email
    let password = req.body.password
    db.getDb().collection('users').findOne({'email':email,'password':password},(err,result)=>{
        if(result) {
            console.log(result)
            let username = result.username
            res.send({'status':1,'username':username})
        }else {
            res.send({'status':0})
        }
    })
}
const savedata = (req,res)=>{
    let email = req.body.email
    let data = req.body.data
    let appid=req.body.appId
    let string='main.appdata.'+appid
    let set={}
    set[string]=data
    db.getDb().collection('users').findOneAndUpdate({'email':email},{$set:set})
    res.send({'status':1})
}

const loaddata = (req,res)=>{
    let email = req.query.email
    let appid=req.query.appId
    db.getDb().collection('users').findOne({'email':email},(err,result)=>{
        let data = result.main.appdata[appid]
        res.send({'status':1,'data':data})
    })
}

const initapp =(req,res)=>{
    let email = req.body.email
    let executors = req.body.executors
    let apps = req.body.apps
    let appdata ={}
    for(let i of Object.keys(apps)){
        appdata[apps[i].appId] = {}
    }
    db.getDb().collection('users').findOneAndUpdate({'email':email},{$set:{'main.appdata':appdata,'main.executors':executors,'main.apps':apps}})
    res.send({'status':1})
}
const saveapp =(req,res)=>{
    let email = req.body.email
    let executors = req.body.executors
    let app = req.body.app
    let appdata = 'main.appdata.'+app.appId
    let s={}
    s[appdata] = {}
    s['main.executors'] = executors
    s['main.apps.'+app.appId] = app
    db.getDb().collection('users').findOneAndUpdate({'email':email},{$set:s})
    res.send({'status':1})
}

const loadapps=(req,res)=>{
    let email = req.query.email
    db.getDb().collection('users').findOne({'email':email},(err,result)=>{
        res.send({'status':1,'data':result.main.apps})
    })
}
const saveapps=(req,res)=>{
    let email =req.body.email
    let appid = req.body.appid
    let executors = req.body.executors
    db.getDb().collection('users').findOne({'email':email},(err,result)=>{
        let appdata = result.main.appdata
        delete appdata[appid]
        let apps = result.main.apps
        delete apps[appid]
        db.getDb().collection('users').findOneAndUpdate({'email':email},{$set:{'main.appdata':appdata,'main.apps':apps,'main.executors':executors}})
        res.send({'status':1})
    })
}
module.exports={getApps,getApp,signup,login,savedata,loaddata,initapp,saveapp,loadapps,saveapps}

