const fs = require('fs')
const path = require('path')
let appname = process.argv[2]
let appid = process.argv[3]
if(appname==undefined){
    appname = 'app-name'
}
if(appid == undefined){
    appid='app-id'
}
fs.mkdir(path.join(__dirname,appid),(err)=>{})
let htmlpath = path.join(__dirname,appid,appid+'.html')
let csspath = path.join(__dirname,appid,appid+'.css')
let jspath = path.join(__dirname,appid,appid+'.js')

let htmlcontent = `<div id=\"${appid}\">\n` +
    `    <div id=\"${appid}-bar\" class=\"${appid}\">\n` +
    `        <label style=\"margin: auto 5px\"><i class=\"{edit-icon}\" style=\"margin: auto 5px\"></i>${appname}</label>\n` +
    `        <div class=\"${appid}-flex-row\" style=\"margin: auto 5px\">\n` +
    `            <i class=\"fal fa-window-minimize\" id=\"${appid}-minimize\" style=\"padding: 2px 5px;margin: 2px 5px\"></i>\n` +
    `            <i class=\"fal fa-times\" id=\"${appid}-close\" style=\"padding: 2px 5px;margin: 2px 5px\"></i>\n` +
    "        </div>\n" +
    "    </div>\n" +
    `    <div class=\"${appid}-flex-column\" id=\"${appid}-main-page\">\n` +
    "\n" +
    "    </div>\n" +
    "</div>\n"

let csscontent = "."+appid+"-flex-row{\n" +
    "    display: flex;\n" +
    "    flex-direction: row;\n" +
    "}\n" +
    "."+appid+"-flex-column{\n" +
    "    display: flex;\n" +
    "    flex-direction: column;\n" +
    "}\n" +
    "."+appid+"-scale15{\n" +
    "    transform: scale(1.5);\n" +
    "}\n" +
    "#"+appid+"{\n" +
    "    height: 100%;\n" +
    "    width: 100%;\n" +
    "    position: absolute;\n" +
    "    top: 0;\n" +
    "    left: 0;\n" +
    "    font-family: \"Open Sans\", sans-serif;\n" +
    "}\n" +
    "#"+appid+"-bar {\n" +
    "    position: absolute;\n" +
    "    top: 0;\n" +
    "    left: 0;\n" +
    "    justify-content: space-between;\n" +
    "    width: 100%;\n" +
    "    height: 30px;\n" +
    "}\n" +
    "#"+appid+"-main-page {\n" +
    "    position: absolute;\n" +
    "    top: 30px;\n" +
    "    left: 0;\n" +
    "    width: 100%;\n" +
    "    height: 100%;\n" +
    "}\n"+
    "#"+appid+"-minimize:hover, #"+appid+"-close:hover{\n" +
    "    cursor: pointer;\n" +
    "    background: rgba(255, 243, 224,1);\n" +
    "}"
let jscontent = "document.getElementById('"+appid+"-minimize').onclick = ()=>{\n" +
    "    sys.minimizeApp('"+appid+"')\n" +
    "}\n" +
    "document.getElementById('"+appid+"-close').onclick=()=>{\n" +
    "    taskmanager.KillApp('"+appid+"')\n" +
    "}\n"+
    "//Function to allow for dark mode \n"+
    "function "+appid+"_paint() {\n" +
    "    document.getElementById('"+appid+"').style.backgroundColor=effective.background\n" +
    "    document.getElementById('"+appid+"').style.color=effective.fontcolor\n" +
    "}\n"+
    appid+"_paint()"

fs.writeFile(htmlpath,htmlcontent,(err,res)=>{})
fs.writeFile(csspath,csscontent,(err,res)=>{})
fs.writeFile(jspath,jscontent,(err,res)=>{})
console.log('App created successfully :)')
