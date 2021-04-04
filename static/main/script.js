var effective={
    background:'rgba(38, 50, 56,1)',
    fontcolor:'rgba(187, 222, 251,1)',
    foreground:'rgba(55, 71, 79,1)',
    buttonbackgroundColor: 'rgba(234, 128, 252,0.7)',
    buttoncolor:'rgba(243, 229, 245,1)',
    borderColor:'rgba(252, 228, 236,1)'
}
var months={1:'Jan',2:'Feb',3:'Mar',4:'Apr',5:'May',6:'Jun',7:'Jul',8:'Aug',9:'Sep',10:'Oct',11:'Nov',12:'Dec'}
var add='add',remove='remove'
var appfocused=0
var userdetails={'name':0,'email':0,'password':0}
var clockKeeper, maxZIndex=1,md=0,selected=0,curx,cury,objx,objy

var appview = 0, runapp=0, userprofile=0,notification=0
var clockicon = "<i class='fal fa-clock' style='margin: auto 5px' id='clock'></i>"
var calendericon = "<i class='fal fa-calendar-alt' style='margin: auto 5px' id='calendar'></i>"
var keyupPipeline={}

class TaskManager{
    executeAppPipeline={}
    killAppPipeline={}
    taskmanager={

    }

    runInBackground(appId){
        this.taskmanager[appId].background=1
        document.getElementById(appId).style.display='none'
        console.log('app running in background')
        sys.taskbarModifier(remove,appId)
        console.log(this.taskmanager)
    }

    executeApp(appId,cmd=''){
        if(!this.isRunning(appId)) {
            this.taskmanagerModifier(add, appId,cmd)
            sys.taskbarModifier(add, appId)
            this.loadResources(appId)
            let keys = Object.keys(this.executeAppPipeline)
            for (let i = 0; i < keys.length; i++) {
                let e = this.executeAppPipeline[keys[i]]
                for (let sd = 0; sd < e.length; sd++)
                    e[sd](this.taskmanager[appId])
                }
        }
        else if(this.isRunning(appId) && this.taskmanager[appId].background){
            console.log(46)
            document.getElementById(appId).style.display='flex'
            sys.taskbarModifier(add,appId)
            this.taskmanager[appId].background=0
        }
        else{
            sys.maximizeApp(appId)
        }
    }
    applicationexecutor(name,options){
        let ext = name.split('.')
        ext = ext[ext.length-1]
        console.log(name,options,ext)
        if(appmanager.executors[ext].length>0){
            this.executeApp(appmanager.executors[ext][0],options)
        }
        else{
            console.log('error',86)
        }
    }

    KillApp(appId){
        this.clearResources(appId)
        sys.taskbarModifier(remove,appId)
        this.taskmanagerModifier(remove,appId)
        let keys = Object.keys(this.executeAppPipeline)
        for(let i=0;i<keys.length;i++){
            let e = this.killAppPipeline[keys[i]]
            for(let sd=0;sd<e.length;sd++)
                e[sd](appId)
        }
        delete this.killAppPipeline[appId]
        delete this.executeAppPipeline[appId]
        delete keyupPipeline[appId]
    }
    restartApp(appId) {
        this.KillApp(appId)
        this.executeApp(appId)
    }
    loadResources(appId){
        let appcode = appmanager.Apps[appId].code
        let xhr = new XMLHttpRequest()
        xhr.onreadystatechange = function (){
            if(xhr.readyState == 4){
                let res = xhr.response
                let main = document.createElement('div')
                main.innerHTML = res
                main = main.firstChild
                maxZIndex+=1
                main.style.zIndex=maxZIndex
                main.style.animationFillMode='forwards'
                main.style.animationDuration='0.5s'
                main.style.animationName='defade'
                main.onclick = (e)=>{
                    if(e.target.id.length==0)
                        appfocused = e.path[e.path.length-7].id
                    else
                        appfocused = e.target.id.split('-')[0]
                }
                document.getElementById('app-runner').append(main)
                document.getElementById(appId+'-bar').onclick = (e)=>{
                    try {
                        maxZIndex += 1
                        document.getElementById(e.target.id.split('-')[0]).style.zIndex = maxZIndex
                    }catch (e) {}
                }
                document.getElementById(appId+'-bar').ondblclick = (e)=>{
                    if(selected == e.target.id.split('-')[0]){
                        selected = cury = curx = objx = objy = md=0
                    }
                    else {
                        try {
                            selected = e.target.id.split('-')[0]
                            md = 1
                            curx = e.clientX
                            cury = e.clientY
                            let pos = document.getElementById(selected).getBoundingClientRect()
                            objx = pos.left;
                            objy = pos.top
                        }catch (e) {
                            selected = cury = curx = objx = objy = md=0
                        }
                    }
                }
                let style = document.createElement('link')
                let script = document.createElement('script')
                if(appmanager.Apps[appId].sys) {
                    style.href = `http://localhost:2000/apps/sys/${appId}/${appId}.css`
                    script.src = `http://localhost:2000/apps/sys/${appId}/${appId}.js`
                }
                else {
                    style.href = `http://localhost:2000/apps/custom/${appId}/${appId}.css`
                    script.src = `http://localhost:2000/apps/custom/${appId}/${appId}.js`
                }
                style.id = appId+'-css';script.id=appId+'-js'
                style.rel = 'stylesheet';style.type= 'text/css';
                document.head.append(style,script)
            }
        }
        xhr.open('GET',appcode)
        xhr.send()
    }

    clearResources(appid){
        document.head.removeChild(document.getElementById(appid+'-css'))
        document.head.removeChild(document.getElementById(appid+'-js'))
        document.getElementById('app-runner').removeChild(document.getElementById(appid))
    }
    taskmanagerModifier(status,appId,cmd=''){
        if(status == add){
            this.taskmanager[appId] = {
                minimize:0,
                appname:appmanager.Apps[appId].appname,
                processid:appId,
                zIndex:maxZIndex,
                cmdline:cmd,
                background:0,
                forceKill:0
            }
        }
        else if(status == remove){
            delete this.taskmanager[appId]
        }
    }
    isRunning(appId){
        return !!this.taskmanager[appId];
    }
}
class AppManager{
    Apps={
        njk2d4kd:{
            code:'http://localhost:2000/apps/sys/njk2d4kd/njk2d4kd.html',
            iconTpe:'fa',
            iconSrc:'fal fa-cog',
            appname:'Settings',
            sys:1,
            appId:'njk2d4kd',
            exec:[],
            permission:{
                read:1,
                write:1,
                modify:1
            },
            notification:1
        },
        df3mk3lm:{
            code:'http://localhost:2000/apps/sys/df3mk3lm/df3mk3lm.html',
            iconTpe: 'fa',
            iconSrc: 'fal fa-tasks-alt',
            appname:'Task manager',
            sys:1,
            appId:'df3mk3lm',
            exec:[],
            permission:{
                read:1,
                write:1,
                modify:1
            },
            notification:1
        },
        dfo3imf3:{
            code:'http://localhost:2000/apps/sys/dfo3imf3/dfo3imf3.html',
            iconTpe:'fa',
            iconSrc: 'fab fa-app-store',
            appname:'App store',
            sys:1,
            appId:'dfo3imf3',
            exec:[],
            permission:{
                read:1,
                write:1,
                modify:1,
                install:1
            },
            notification:1
        },
        njk39c3ce: {
            code: 'http://localhost:2000/apps/sys/njk39c3ce/njk39c3ce.html',
            iconTpe: 'fa',
            iconSrc: 'fal fa-calculator-alt',
            appname: 'calculator',
            sys: 1,
            appId: 'njk39c3ce',
            exec: [],
            permission:{
                read:1,
                write:1,
                modify:1
            },
            notification:1
        },
        xo23qwrr: {
            code: 'http://localhost:2000/apps/sys/xo23qwrr/xo23qwrr.html',
            iconTpe: 'fa',
            iconSrc: 'fal fa-image',
            appname: 'Image viewer',
            sys: 1,
            appId: 'xo23qwrr',
            exec: ['png','jpg','jpeg'],
            permission:{
                read:1,
                write:0,
                modify:0
            },
            notification:1
        },
        oermfo3f:{
            code: 'http://localhost:2000/apps/sys/oermfo3f/oermfo3f.html',
            iconTpe: 'fa',
            iconSrc: 'fal fa-clock',
            appname: 'Clock',
            sys: 1,
            appId: 'oermfo3f',
            exec: [],
            permission:{
                read:0,
                write:0,
                modify:0
            },
            notification:1
        },
        cal2f4f43:{
            code: 'http://localhost:2000/apps/sys/cal2f4f43/cal2f4f43.html',
            iconTpe: 'fa',
            iconSrc: 'fal fa-calendar-alt',
            appname: 'Calendar',
            sys: 1,
            appId: 'cal2f4f43',
            exec: [],
            permission:{
                read:0,
                write:1,
                modify:0
            },
            notification:1
        }
    }
    executors = {
        'png':['xo23qwrr'],
        'jpg':['xo23qwrr'],
        'jpeg':['xo23qwrr'],
    }
    AppId = {settings:'njk2d4kd',taskmanager:'df3mk3lm',appstore:'dfo3imf3'}
    permission={

    }

    saveApp(app) {
        if(userdetails['email']!=0)
            datamanager.saveapp(app)
    }
    install(appid,app,callback){
        if(this.Apps[appid].permission.install) {
            this.Apps[app.appId] = app
            this.Apps[app.appId].notfication=1
            if (app.exec.length != 0) {
                for (let i of app.exec) {
                    if (this.executors[i])
                        this.executors[i].push(app.appId)
                    else {
                        this.executors[i] = [app.appId]
                    }
                }
            }
            if(callback)callback(true,app)
            this.saveApp(app)
            sys.initAppview()

        }
        else{
            if(callback)callback(false,app)
        }
    }
    uninstall(appId) {
        delete appmanager.Apps[appId]
        if (taskmanager.isRunning(appId)) {
            taskmanager.KillApp(appId)
        }
        if (Object.values(sys.settings.appdrawer.icons.left).indexOf(appId) != -1) {
            document.getElementById('app-drawer').removeChild(document.getElementById(appId + '-drawer'))
            let index = Object.values(sys.settings.appdrawer.icons.left).indexOf(appId)
            sys.settings.appdrawer.icons.left[index + 1] = 0
            for (let i = index + 1; i < sys.settings.appdrawer.icons.leftc - 1; i++) {
                sys.settings.appdrawer.icons.left[i] = sys.settings.appdrawer.icons.left[i + 1]
                sys.settings.appdrawer.icons.left[i + 1] = 0
                sys.settings.appdrawer.icons.leftc -= 1
            }
        } else if (Object.values(sys.settings.appdrawer.icons.right).indexOf(appId) != -1) {
            document.getElementById('app-drawer').removeChild(document.getElementById(appId + '-drawer'))
            document.getElementById('app-drawer').removeChild(
                document.getElementById(appId + '-drawer'))
            let index = Object.values(sys.settings.appdrawer.icons.right).indexOf(appId)
            sys.settings.appdrawer.icons.right[index + 1] = 0
            for (let i = index + 1; i < sys.settings.appdrawer.icons.rightc - 1; i++) {
                sys.settings.appdrawer.icons.right[i] = sys.settings.appdrawer.icons.right[i + 1]
                sys.settings.appdrawer.icons.right[i + 1] = 0
                sys.settings.appdrawer.icons.rightc -= 1
            }
        }
        for (let i of Object.keys(this.executors)) {
            if (this.executors[i].indexOf(appId) != -1) {
                this.executors[i] = this.executors[i].slice(0, this.executors[i].indexOf(appId)).concat(this.executors.slice(this.executors[i].indexOf(appId) + 1,))
            }
        }
        datamanager.saveapp(this.Apps)
        sys.initAppview()

    }
    loadApps(){
        let xhr = new XMLHttpRequest()
        xhr.onreadystatechange = function () {
            if(xhr.readyState==4){
                let res = JSON.parse(xhr.response)
                if(res.status){
                    console.log(res.data)
                    appmanager.Apps=res.data
                    sys.initAppview()
                }
            }
        }
        xhr.open('GET','http://localhost:2000/loadapps?email='+userdetails['email'])
        xhr.send()
    }

    requestPermission(appId,permType,callback){
        if(permType in {read:1,write:1,modify:1,install: 1}) {
            if (appId in this.permission) {
                if (callback) callback(false)
            }
            else {
                if (!appmanager.Apps[appId][permType]) {
                    this.permission[appId] = permType
                    this.permissionobject(appId, 'Allow Permission to ' + permType + ' files', permType, callback)
                }
                else{
                    if(callback) callback(true)
                }
            }
        }
        else{
            if(callback)callback(false)
        }
    }
    grantPermission(appId,status,permType,callback){
        if (status) {
            this.Apps[appId].permission[permType]= 1
            datamanager.saveapp(this.Apps[appId])
            if(callback)callback(true)
        }
        else
            if(callback)callback(false)
    }
    permissionobject(appId,text,permType,callback){
        let d = document.createElement('div')
        d.innerHTML = "<div class=\"permission-window\">\n" +
            `        <p class=\"permission-msg\">${text}</p>\n` +
            "        <div style=\"display: flex;flex-direction: row;margin: 10px auto;\">\n" +
            `            <label class=\"deny\" id='${appId}-${permType}-deny'>Deny</label>\n` +
            `           <label class=\"allow\" id='${appId}-${permType}-allow'>Allow</label>\n` +
            "        </div>\n" +
            "    </div>"
        let ele = d.firstChild
        document.getElementById('root').append(ele)
        document.getElementById(appId+'-'+permType+'-deny').onclick = (e)=> {
            document.getElementById('root').removeChild(
                document.getElementById(e.target.id).parentElement.parentElement
            )
            delete this.permission[appId]
            this.grantPermission(e.target.id.split('-')[0], false,e.target.id.split('-')[1], callback)
        }
        document.getElementById(appId+'-'+permType+'-allow').onclick = (e)=>{
            document.getElementById('root').removeChild(
                document.getElementById(e.target.id).parentElement.parentElement
            )
            delete this.permission[appId]
            this.grantPermission(e.target.id.split('-')[0],true,e.target.id.split('-')[1],callback)
        }
    }
    hasInstallPermission(appId){
        return this.Apps[appId].install == 1
    }
    removePermission(appId,perType){
        this.Apps[appId].permission[perType] =0
    }
    notifcation(appId){
        this.Apps[appId].notification = !this.Apps[appId].notification
    }

}


class System{
    appfocused=0
    settings= {
        theme: {
            darkMode: 0,
        },
        taskbar: {
            transparency: 0,
            color: 'theme',
            background: '',
            foreground: '',
            font: '',
            date: 0,
            dock: 0,
            taskbaropen: 0,
        },
        datetime: {
            automatic: 1,
            date: 0,
            month: 0,
            year: 0,
            hrs: 0,
            min: 0,
            sec: 0,
        },
        background: {
            backgroundimage: 0,
            backgroundcolor: '#f08282',
            backgroundurl: '',
        },
        appdrawer: {
            onlyhome: 0,
            icons: {
                left: {
                    1:0,
                    2:0,
                    3:0
                },
                right: {
                    1:0,
                    2:0,
                    3:0
                },
                leftc:1,
                rightc:1
            },
            search:0
        },
        controlpannel:{
            accounts:{
            },
            loggedin:0,
            data:{
                lastsaved:'Never',
                saveperiod:1,
                interval:10
            }
        }
    }
    default_settings= {
        theme: {
            darkMode: 0,
        },
        taskbar: {
            transparency: 0,
            color: 'theme',
            background: '',
            foreground: '',
            font: '',
            date: 0,
            dock: 0,
            taskbaropen: 0,
        },
        datetime: {
            automatic: 1,
            date: 0,
            month: 0,
            year: 0,
            hrs: 0,
            min: 0,
            sec: 0,
        },
        background: {
            backgroundimage: 0,
            backgroundcolor: '#f08282',
            backgroundurl: '',
        },
        appdrawer: {
            onlyhome: 0,
            icons: {
                left: {
                    1:0,
                    2:0,
                    3:0
                },
                right: {
                    1:0,
                    2:0,
                    3:0
                },
                leftc:1,
                rightc:1
            },
            search:0
        },
        controlpannel:{
            accounts:{
            },
            loggedin:0,
            data:{
                lastsaved:'Never',
                saveperiod:1,
                interval:10
            }
        }
    }
    notifications={

    }

    darkmodeColors = {
        background: 'rgba(33, 33, 33,1)',
        fontcolor: 'rgba(187, 222, 251,1)',
        foreground: 'rgb(32,40,44)',
        buttonbackgroundColor: 'rgba(234, 128, 252,0.7)',
        buttoncolor: 'rgba(243, 229, 245,1)',
        borderColor: 'rgba(252, 228, 236,1)'
    }
    lightmodeColors= {
        background: 'rgba(255, 255, 255,1)',
        fontcolor: 'rgb(13,22,28)',
        foreground: 'rgb(249,249,248)',
        buttonbackgroundColor: 'rgba(74, 20, 140,0.7)',
        buttoncolor: 'rgba(225, 190, 231,1)',
        borderColor: 'rgba(248, 187, 208,0.6)'
    }

    loadsettings(){
        datamanager.load('njk2d4kd',(res)=>{
            this.settings = res
            this.changeTheme()
            this.initSettings()
        })
    }
    savesettings(){
        datamanager.save('njk2d4kd',this.settings)
        this.settings.controlpannel.data.lastsaved=new Date().toDateString()
    }
    getDate(){
        if(this.settings.datetime.automatic)
            return new Date()
        else
            return new Date(this.settings.datetime.year,this.settings.datetime.month,
                this.settings.datetime.date,this.settings.datetime.hrs,
                this.settings.datetime.min,this.settings.datetime.sec)
    }

    reset(){
        this.settings = JSON.parse(JSON.stringify(this.default_settings))
        this.changeTheme()
        this.initSettings()
    }

    isappdrawerfull(){
        return [this.settings.appdrawer.icons.leftc == 4,this.settings.appdrawer.icons.rightc == 4]
    }

    appDrawerModifier(status,side,appId){
        if(status ==add){
            if(side=='left'){
                this.settings.appdrawer.icons.left[this.settings.appdrawer.icons.leftc.toString()] = appId
                this.settings.appdrawer.icons.leftc+=1
                this.savesettings()
            }
            else{
                this.settings.appdrawer.icons.right[this.settings.appdrawer.icons.rightc.toString()] = appId
                this.settings.appdrawer.icons.rightc+=1
                this.savesettings()
            }
        }
        else if(status==remove){
            if(side=='left'){
                this.settings.appdrawer.icons.leftc-=1
                this.settings.appdrawer.icons.left[this.settings.appdrawer.icons.leftc.toString()] = 0
                this.savesettings()
            }
            else{
                this.settings.appdrawer.icons.rightc-=1
                this.settings.appdrawer.icons.right[this.settings.appdrawer.icons.rightc.toString()] = 0
                this.savesettings()
            }
        }
    }

    isfoucused(appId){
        return this.appfocused == appId;
    }
    showdateonly() {
        if(!this.settings.taskbar.date){
            document.getElementById('date').style.display = 'inline'
            document.getElementById('date-time-sidekick').style.display = 'inline'
        }
        else{
            document.getElementById('date').style.display = 'none'
            document.getElementById('date-time-sidekick').style.display = 'none'
        }
    }
    taskbardock() {
        if(this.settings.taskbar.dock){
            document.getElementById('taskbar').style.animationName = 'undock-taskbar'
        }
        else{
            document.getElementById('taskbar').style.animationName='dock-taskbar'
            setTimeout(()=>{
                document.getElementById('taskbar').style.animationName =''
            },1000)
        }
    }

    changeDateTime(date,month,year,hrs,min,sec) {
        if(!this.settings.datetime.automatic){
            this.settings.datetime.date = date
            this.settings.datetime.month = month
            this.settings.datetime.year = year
            this.settings.datetime.hrs = hrs
            this.settings.datetime.min = min
            this.settings.datetime.sec = sec
            this.savesettings()
        }
    }

    changeTheme(){
        if(this.settings.theme.darkMode){
            effective.background = this.darkmodeColors.background
            effective.foreground = this.darkmodeColors.foreground
            effective.fontcolor = this.darkmodeColors.fontcolor
            effective.borderColor = this.darkmodeColors.borderColor
            effective.buttonbackgroundColor = this.darkmodeColors.buttonbackgroundColor
            effective.buttoncolor = this.darkmodeColors.buttoncolor
        }
        else{
            effective.background = this.lightmodeColors.background
            effective.foreground = this.lightmodeColors.foreground
            effective.fontcolor = this.lightmodeColors.fontcolor
            effective.borderColor = this.lightmodeColors.borderColor
            effective.buttonbackgroundColor = this.lightmodeColors.buttonbackgroundColor
            effective.buttoncolor = this.lightmodeColors.buttoncolor
        }
    }

    switchdarkmode(){
        if(this.settings.theme.darkMode){
            this.settings.theme.darkMode=0
        }
        else{
            this.settings.theme.darkMode=1
        }
        this.savesettings()
    }
    switchtheme(value){
        this.settings.taskbar.color=value
        this.savesettings()
    }
    switchtransparency(){
        if(this.settings.taskbar.transparency){
            this.settings.taskbar.transparency=0
        }
        else{
            this.settings.taskbar.transparency=1
        }
        this.savesettings()
    }
    switchdate(){
        if(this.settings.taskbar.date){
            this.settings.taskbar.date=0
        }
        else{
            this.settings.taskbar.date=1
        }
        this.savesettings()
    }
    switchdock(){
        if(this.settings.taskbar.dock){
            this.settings.taskbar.dock=0
        }
        else{
            this.settings.taskbar.dock=1
        }
        this.savesettings()
    }
    switchauto(){
        if(this.settings.datetime.automatic){
            this.settings.datetime.automatic=0
        }
        else{
            this.settings.datetime.automatic=1
        }
        this.savesettings()
    }
    setbackground(key,value){
        this.settings.background[key] = value
        this.savesettings()
    }
    switchhome(){
        if(this.settings.appdrawer.onlyhome){
            this.settings.appdrawer.onlyhome=0
        }
        else{
            this.settings.appdrawer.onlyhome=1
        }
        this.savesettings()
    }
    switchcearch(){
        if(this.settings.appdrawer.search){
            this.settings.appdrawer.search=0
        }
        else{
            this.settings.appdrawer.search=1
        }
        this.savesettings()
    }
    minimizeApp(appId) {
        document.getElementById(appId).style.display = 'none'
        taskmanager.taskmanager[appId].minimize=1
    }
    maximizeApp(appId) {
        document.getElementById(appId).style.display = 'inline'
    }
    notify(appId,msg,exec=null){
        if(appmanager.Apps[appId].notification) {
            let rnd=appId+Math.floor(Math.random()*100)
            this.notifications[rnd] = msg
            document.getElementById('no-notifications').style.display = 'none'
            document.getElementById('clear-all').style.display = 'inline'
            let ele = document.createElement('div')
            ele.className = 'notification-window-obj'
            ele.style.animationFillMode = 'forwards'
            ele.style.animationDuration = '0.4s'
            let name = document.createElement('label')
            name.innerText = appmanager.Apps[appId].appname
            name.style.fontSize = 'large'
            name.style.margin = '10px'

            let message = document.createElement('p')
            message.style.wordBreak = 'break-all'
            message.innerText = msg
            message.style.margin = '5px 5px 5px 20px'
            let clear = document.createElement('label')
            clear.className = 'clear'
            clear.innerText = 'clear'
            clear.id = rnd + '-clear'
            clear.onclick = (e) => {
                let id = e.target.id.split('-')
                document.getElementById(e.target.id).parentElement.style.animationName = 'clear-notification'
                setTimeout(() => {
                    delete this.notifications[id[0]]
                    if (Object.keys(this.notifications).length == 0) {
                        document.getElementById('no-notifications').style.display = 'inline'
                        document.getElementById('clear-all').style.display = 'none'
                    }
                    try {
                        document.getElementById('notification-window').removeChild(document.getElementById(id).parentElement)
                    }catch (e) {}
                }, 400)
            }
            ele.append(name, message, clear)
            document.getElementById('notification-window').append(ele)
            if (!notification)
                document.getElementById('notification-btn').style.color = 'red'
        }
    }

    taskbarModifier(status,appId){
        if(status==add) {
            let ele;
            if (appmanager.Apps[appId].iconTpe == 'fa') {
                ele = document.createElement('i')
                ele.className = appmanager.Apps[appId].iconSrc + ' app-pinned-obj scale15'
                if(this.settings.taskbar.color == 'custom')
                    ele.style.backgroundColor = this.settings.taskbar.foreground
                else if(this.settings.taskbar.transparency)
                    ele.style.backgroundColor = 'transparent'
                else
                    ele.style.backgroundColor = effective.foreground
            } else {
                ele = document.getElementById('img')
                ele.src = appmanager.Apps[appId].iconSrc
                ele.className = 'app-pinned-obj scale15'
            }

            ele.id = appId + '-min'
            ele.onclick=(e)=>{
                let id= e.target.id
                let appId = id.split('-')[0]
                if(taskmanager.taskmanager[appId].minimize==1){
                    console.log(2)
                    this.maximizeApp(appId)
                    maxZIndex+=1
                    document.getElementById(appId).style.zIndex=maxZIndex
                    taskmanager.taskmanager[appId].minimize=0
                }
                else{
                    maxZIndex+=1
                    document.getElementById(appId).style.zIndex=maxZIndex
                }
            }
            document.getElementById('app-pinned').append(ele)
        }
        else if(status==remove){
            try {
                document.getElementById('app-pinned').removeChild(document.getElementById(appId + '-min'))
            }catch (e) {}
        }
    }
    initSettings() {
        //initialin taskbar colors
        if (this.settings.taskbar.transparency) {
            document.getElementById('app-pinned').style.backgroundColor = 'transparent'
            document.getElementById('app-pinned').style.color = this.darkmodeColors.fontcolor
            let ele = document.getElementsByClassName('app-pinned-obj')
            for (let i = 0; i < ele.length; i++) {
                ele[i].style.backgroundColor = 'transparent'
            }

            document.getElementById('app-drawer').style.backgroundColor = 'transparent'
            document.getElementById('app-drawer').style.color = this.darkmodeColors.fontcolor
            ele = document.getElementsByClassName('app-drawer-obj')
            for (let i = 0; i < ele.length; i++) {
                ele[i].style.backgroundColor = 'transparent'
            }

            document.getElementById('date-time').style.backgroundColor = 'transparent'
            document.getElementById('date-time').style.color = this.darkmodeColors.fontcolor
        } else if (this.settings.taskbar.color == 'theme') {
            document.getElementById('app-pinned').style.backgroundColor = effective.background
            document.getElementById('app-pinned').style.color = effective.fontcolor
            let ele = document.getElementsByClassName('app-pinned-obj')
            for (let i = 0; i < ele.length; i++) {
                ele[i].style.backgroundColor = effective.foreground
            }

            document.getElementById('app-drawer').style.backgroundColor = effective.background
            document.getElementById('app-drawer').style.color = effective.fontcolor
            ele = document.getElementsByClassName('app-drawer-obj')
            for (let i = 0; i < ele.length; i++) {
                ele[i].style.backgroundColor = effective.foreground
            }

            document.getElementById('date-time').style.backgroundColor = effective.background
            document.getElementById('date-time').style.color = effective.fontcolor
        } else if (this.settings.taskbar.color == 'custom') {
            document.getElementById('app-pinned').style.backgroundColor = effective.background
            document.getElementById('app-pinned').style.color = effective.fontcolor
            let ele = document.getElementsByClassName('app-pinned-obj')
            for (let i = 0; i < ele.length; i++) {
                ele[i].style.backgroundColor = effective.foreground
            }

            document.getElementById('app-drawer').style.backgroundColor = effective.background
            document.getElementById('app-drawer').style.color = effective.fontcolor
            ele = document.getElementsByClassName('app-drawer-obj')
            for (let i = 0; i < ele.length; i++) {
                ele[i].style.backgroundColor = effective.foreground
            }

            document.getElementById('date-time').style.backgroundColor = effective.background
            document.getElementById('date-time').style.color = effective.fontcolor
        }

        if(this.settings.taskbar.date){
            document.getElementById('date').style.display = 'none'
        }

        if(this.settings.taskbar.dock){
            sys.taskbardock()
        }

        document.getElementById('app-view').style.backgroundColor = effective.background
        document.getElementById('app-view').style.color = effective.color

        document.getElementById('search-input').style.backgroundColor = effective.foreground
        document.getElementById('search-input').style.color = effective.fontcolor

        //document.getElementById('app-view-left').style.backgroundColor = effective.background
        document.getElementById('app-view-left').style.color = effective.fontcolor
        //document.getElementById('app-view-right').style.backgroundColor = effective.background
        document.getElementById('app-view-right').style.color = effective.fontcolor

        document.getElementById('run-app-window').style.backgroundColor = effective.background
        document.getElementById('run-app-window').style.color = effective.fontcolor

        document.getElementById('run-app-input').style.backgroundColor = effective.foreground
        document.getElementById('run-app-input').style.color = effective.fontcolor

        document.getElementById('user-profile-window').style.backgroundColor = effective.background
        document.getElementById('user-profile-window').style.color = effective.fontcolor

        document.querySelector('#user-profile-window div input').style.backgroundcolor = effective.foreground
        document.querySelector('#user-profile-window div input').style.color = effective.fontcolor

        document.getElementById('app-runner').style.backgroundColor = this.settings.background.backgroundcolor


        if (this.settings.background.backgroundimage){
            document.getElementById('app-runner').style.background = `url(${this.settings.background.backgroundurl})`
            document.getElementById('app-runner').style.backgroundSize = `cover`
        }
        else{
            document.getElementById('app-runner').style.background = this.settings.background.backgroundcolor
        }


    }
    initAppview() {
        document.getElementById('app-view-right').innerText = ''
        let keys = Object.keys(appmanager.Apps)
        console.log(keys)
        for(let i=0;i<keys.length;i++){
            let ic
            let div = document.createElement('label')
            div.className = "app-view-obj flex-column obj-margin"
            if(appmanager.Apps[keys[i]].iconTpe == 'fa') {
                ic = document.createElement('i')
                ic.className = 'scale15 center ' + appmanager.Apps[keys[i]].iconSrc
                ic.id = appmanager.Apps[keys[i]].appId+'-icon'
            }
            ic.onclick = (e)=>{
                let id = e.target.id.split('-')[0]
                document.getElementById('home').click()
                setTimeout(()=>{
                    taskmanager.executeApp(id)
                },500)
            }
            let n = document.createElement('label')
            n.innerText = appmanager.Apps[keys[i]].appname
            n.className = 'text-margin'
            n.style.maxWidth='70px'
            n.style.textAlign ='center'
            n.style.wordBreak='normal'
            div.append(ic,n)
            document.getElementById('app-view-right').append(div)
        }
    }
    startClock() {
        clockKeeper = setInterval(this.clock, 1000)
    }
    clock = ()=> {
        if (sys.settings.datetime.automatic) {
            let d = new Date()
            document.getElementById('date').innerHTML =
                `${calendericon} ${d.getDate().toString().length==1? '0'+d.getDate().toString():d.getDate()} ${months[d.getMonth() + 1]} ${d.getFullYear()}`
            document.getElementById('time').innerHTML =
                `${clockicon} ${d.getHours().toString().length==1? '0'+d.getHours().toString() : d.getHours()} : ${d.getMinutes().toString().length==1? '0'+d.getMinutes().toString():d.getMinutes()} : ${d.getSeconds().toString().length==1?'0'+d.getSeconds().toString():d.getSeconds()}`
        } else {
            let d = new Date(sys.settings.datetime.year, sys.settings.datetime.month, sys.settings.datetime.date,
                sys.settings.datetime.hrs, sys.settings.datetime.min, sys.settings.datetime.sec)
            document.getElementById('date').innerText = `${d.getDate()} / ${d.getMonth() + 1} / ${d.getFullYear()}`
            document.getElementById('time').innerText = `${d.getHours()} : ${d.getMinutes()} : ${d.getSeconds()}`
            sys.settings.datetime.date = d.getDate()
            sys.settings.datetime.month = d.getMonth()
            sys.settings.datetime.year = d.getFullYear()
            sys.settings.datetime.hrs = d.getHours()
            sys.settings.datetime.min = d.getMinutes()
            sys.settings.datetime.sec = d.getSeconds() + 1
        }
    }
    addaccount(appId,userdetail){
        if(appmanager.Apps[appId].permission.modify) {
            this.settings.controlpannel.accounts[userdetail['email']] = userdetail
            this.settings.controlpannel.loggedin = userdetail['email']
            let xhr = new XMLHttpRequest()
            xhr.onreadystatechange = function () {
                if(xhr.readyState == 4){
                    let res = JSON.parse(xhr.response)
                    if(res.status==1){
                        userdetails['name']=userdetail['name']
                        userdetails['email']=userdetail['email']
                        userdetails['password']=userdetail['password']
                        document.getElementById('username').innerText=userdetail['name']
                        sys.savesettings()
                        //TODO:save settings or default settings?
                    }
                }
            }
            xhr.open('POST','http://localhost:2000/signup')
            xhr.setRequestHeader('Content-Type','application/json;charset=UTF-8')
            xhr.send(JSON.stringify({'email':userdetail['email'],'password':userdetail['password'],'username':userdetail['name']}))
        }
    }
    login(email,password){
        let xhr = new XMLHttpRequest()
        xhr.onreadystatechange = function () {
            if(xhr.readyState == 4){
                let res = JSON.parse(xhr.response)
                if(res['status']==1) {
                    userdetails['name'] = res['username']
                    userdetails['email'] = email
                    userdetails['password'] = password
                    document.getElementById('username').innerText=userdetails['name']
                    document.getElementById('login-window').style.display ='none'
                    document.getElementById('user-info-window').style.display='flex'
                    sys.loadsettings()
                    appmanager.loadApps()
                }
                else{
                    document.getElementById('login-error').style.display='inline'
                }
            }

        }
        xhr.open('POST','http://localhost:2000/login')
        xhr.setRequestHeader('Content-Type','application/json;charset=UTF-8')
        xhr.send(JSON.stringify({'email':email,'password':password}))
    }
    getaccounts(){
        return this.settings.controlpannel.accounts
    }
    removeaccount(appId,email){
        if(appmanager.Apps[appId].permission.modify) {
            if (this.settings.controlpannel.loggedin == email)
                this.settings.controlpannel.loggedin = 0
            delete this.settings.controlpannel.accounts[email]
        }
    }

}

class DataManager{

    data={}

    initApps(){
        let xhr = new XMLHttpRequest()
        xhr.onreadystatechange = function () {
            if(xhr.readyState == 4){
                let res = JSON.parse(xhr.response)
                console.log(res)
            }
        }
        xhr.open('POST','http://localhost:2000/initapp')
        xhr.setRequestHeader('Content-Type','application/json;charset=UTF-8')
        xhr.send(JSON.stringify({'email':userdetails['email'],'apps':appmanager.Apps,'executors':appmanager.executors}))
    }
    saveapp(app){
        console.log(app)
        let xhr = new XMLHttpRequest()
        xhr.onreadystatechange = function () {
            if(xhr.readyState == 4){
                let res = JSON.parse(xhr.response)
                console.log(res)
            }
        }
        xhr.open('POST','http://localhost:2000/saveapp')
        xhr.setRequestHeader('Content-Type','application/json;charset=UTF-8')
        xhr.send(JSON.stringify({'email':userdetails['email'],'app':app,'executors':appmanager.executors}))
    }

    save(appId,data){
        console.log(appId,data)
        if(this.haswriteAccess(appId) && userdetails['email']!=0) {
            if (data==self)
                data=this.data[appId]
            let xhr = new XMLHttpRequest()
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4) {
                    let res = JSON.parse(xhr.response)
                    console.log(res)
                }
            }
            xhr.open('POST', 'http://localhost:2000/savedata')
            xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
            xhr.send(JSON.stringify({'email': userdetails['email'], 'appId': appId, 'data': data}))
        }
    }
    load(appId,callback){
        if(this.hasreadAccess(appId) && userdetails['email']!=0) {
            let xhr = new XMLHttpRequest()
            xhr.onreadystatechange = () => {
                if (xhr.readyState == 4) {
                    let res = JSON.parse(xhr.response)
                    datamanager.data[appId] = res.data
                    if (callback) callback(res.data)
                }
            }
            xhr.open('GET', `http://localhost:2000/loaddata?appId=${appId}&email=${userdetails['email']}`)
            xhr.send()
        }
        else{
            if(callback) callback(false)
        }
    }
    get(appId){
        return this.data[appId]
    }
    hasreadAccess(appId){
        return appmanager.Apps[appId].permission.read ==1
    }
    hasmodifyAccess(appId){
        return appmanager.Apps[appId].permission.modify ==1
    }
    haswriteAccess(appId) {
        return appmanager.Apps[appId].permission.write == 1
    }

}

var taskmanager = new TaskManager()
var sys = new System()
var datamanager = new DataManager()
var appmanager = new AppManager()

sys.startClock()
sys.changeTheme()
sys.initSettings()
sys.initAppview()


function signup(){
    let email = document.getElementById('signup-email').value
    let name = document.getElementById('signup-username').value
    let password = document.getElementById('signup-password').value
    let xhr = new XMLHttpRequest()
    xhr.onreadystatechange = function () {
        if(xhr.readyState == 4){
            let res = JSON.parse(xhr.response)
            if(res.status==1){
                userdetails['name']=name
                userdetails['email']=email
                userdetails['password']=password
                // sys.addaccount('njk2d4kd',userdetails)
                document.getElementById('username').innerText=name
                document.getElementById('signup-window').style.animationName ='fade'
                datamanager.initApps()
                setTimeout(()=>{
                    document.getElementById('signup-window').style.display ='none'
                    document.getElementById('user-info-window').style.display='flex'
                    document.getElementById('signup-window').style.animationName =''
                    document.getElementById('user-info-window').style.animationName='defade'
                    sys.savesettings()
                },500)
            }
            else{
                document.getElementById('signup-error').style.display='inline'
            }
        }
    }
    xhr.open('POST','http://localhost:2000/signup')
    xhr.setRequestHeader('Content-Type','application/json;charset=UTF-8')
    xhr.send(JSON.stringify({'email':email,'password':password,'username':name}))
}

function login(){
    let email = document.getElementById('login-email').value
    let password = document.getElementById('login-password').value
    let xhr = new XMLHttpRequest()
    xhr.onreadystatechange = function () {
        if(xhr.readyState == 4){
            let res = JSON.parse(xhr.response)
            if(res['status']==1) {
                userdetails['name'] = res['username']
                userdetails['email'] = email
                userdetails['password'] = password
                document.getElementById('username').innerText=userdetails['name']
                document.getElementById('login-window').style.animationName ='fade'
                setTimeout(()=>{
                    document.getElementById('login-window').style.display ='none'
                    document.getElementById('user-info-window').style.display='flex'
                    document.getElementById('user-info-window').style.animationName = 'defade'
                    document.getElementById('login-window').style.animationName =''
                    sys.loadsettings()
                    appmanager.loadApps()
                },500)

            }
            else{
                document.getElementById('login-error').style.display='inline'
            }
        }

    }
    xhr.open('POST','http://localhost:2000/login')
    xhr.setRequestHeader('Content-Type','application/json;charset=UTF-8')
    xhr.send(JSON.stringify({'email':email,'password':password}))
}
function logout(){
    userdetails = {'email':0,'name':0,'password':0}
    sys.reset()
}

document.getElementById('user-profile').onclick = ()=>{
    if(userprofile){
        userprofile=0
        document.getElementById('user-profile-window').style.animationName='hide-user-profile'
        setTimeout(()=>{
            document.getElementById('user-profile-window').style.display='none'
        },600)
    }
    else{
        userprofile =1
        document.getElementById('user-profile-window').style.display='flex'
        document.getElementById('user-profile-window').style.animationName='show-user-profile'
    }
}
document.getElementById('clear-all').onclick =()=>{
    let k =Object.keys(sys.notifications)
    for(let i=0;i<k.length;i++ ){
        delete sys.notifications[k[i]]
        document.getElementById(k[i]+'-clear').click()
    }
}

document.getElementById('login-window-btn').onclick = ()=>{
    document.getElementById('signup-window').style.animationName = 'fade'
    setTimeout(()=>{
        document.getElementById('signup-window').style.display = 'none'
        document.getElementById('login-window').style.display = 'flex'
        document.getElementById('login-window').style.animationName = 'defade'
    },500)
}
document.getElementById('signup-window-btn').onclick = ()=>{
    document.getElementById('login-window').style.animationName = 'fade'
    setTimeout(()=>{
        document.getElementById('login-window').style.display = 'none'
        document.getElementById('signup-window').style.display = 'flex'
        document.getElementById('signup-window').style.animationName = 'defade'
    },500)
}
document.getElementById('signup-btn').onclick = ()=>{
    signup()
}
document.getElementById('login-btn').onclick = ()=>{
    login()
}
document.getElementById('user-settings-save').onclick =()=>{
    sys.savesettings()
}
document.getElementById('logout').onclick =()=>{
    logout()
    document.getElementById('user-info-window').style.animationName = 'fade'
    setTimeout(()=>{
        document.getElementById('user-info-window').style.display = 'none'
        document.getElementById('user-info-window').style.animationName= ''
        document.getElementById('login-window').style.animationName = 'defade'
        document.getElementById('login-window').style.display ='flex'

    },500)

}
document.onmousemove = (e)=>{
    if(sys.settings.taskbar.dock) {
        let y = e.clientY
        if (Math.abs(y - window.innerHeight) < 30) {
            if(sys.settings.taskbar.taskbaropen==0){
                document.getElementById('taskbar').style.animationName = 'dock-taskbar'
                sys.settings.taskbar.taskbaropen=1
            }
        } else {
            if(sys.settings.taskbar.taskbaropen==1)
                setTimeout(() => {
                document.getElementById('taskbar').style.animationName = 'undock-taskbar'
                sys.settings.taskbar.taskbaropen=0
            }, 2000)
        }
    }
    if(md==1){
        let ele = document.getElementById(selected)
        let ydiff=e.clientY-cury
        let xdiff=e.clientX-curx
        let top = objy+ydiff
        let left = objx+xdiff
        ele.style.top =top.toString()+'px';
        ele.style.left=left.toString()+'px';
    }
}

document.onkeyup = (e)=>{
    for(let keys of Object.keys(keyupPipeline)){
        try{
            let fns = keyupPipeline[keys]
            for(let i of fns){
                i(e)
            }
        }catch (error) {}
    }
}
document.onclick = (e)=>{
    if(e.target.id =='app-runner')
        appfocused=0
}

document.getElementById('run-app').onclick = ()=>{
    if(runapp){
        runapp=0
        document.getElementById('run-app-window').style.animationName = 'hide-app-runner'
        setTimeout(()=>{
            document.getElementById('run-app-window').style.display = 'none'
        },500)

    }
    else{
        runapp = 1
        document.getElementById('run-app-window').style.display = 'flex'
        document.getElementById('run-app-window').style.animationName = 'show-app-runner'
        document.getElementById('run-app-input').focus()
    }
}
document.getElementById('close-run-app').onclick = ()=>{
    document.getElementById('run-app').click()
}
document.getElementById('run').onclick =()=>{
    let app = document.getElementById('run-app-input').value
    let appname = app.substring(0,app.lastIndexOf('.')).toLowerCase()
    if(app.endsWith('.html') && appmanager.AppId[appname] && appmanager.AppId[appname].length){
        document.getElementById('close-run-app').click()
        taskmanager.executeApp(appmanager.AppId[appname])
    }
    else{
        document.getElementById('run-app-input').style.color='red'
    }
}

document.getElementById('notification-btn').onclick = ()=>{
    if(notification) {
        notification = 0
        document.getElementById('notification-window').style.animationName = 'hide-notification'
        setTimeout(()=>{
            document.getElementById('notification-window').style.display = 'none'
        },500)

    }
    else {
        notification = 1
        document.getElementById('notification-window').style.display = 'flex'
        document.getElementById('notification-window').style.animationName = 'display-notification'
        document.getElementById('notification-btn').style.color = effective.fontcolor
    }
}

document.getElementById('run-app-input').oninput =()=>{
    document.getElementById('run-app-input').style.color=effective.fontcolor
}
document.getElementById('home').onclick =()=>{
    if(appview == 0){
        appview = 1
        document.getElementById('app-view').style.display = 'flex'
        document.getElementById('app-view').style.animationName = 'show-app-view'

    }
    else{
        appview = 0
        document.getElementById('app-view').style.animationName = 'hide-app-view'
        setTimeout(()=>{
            document.getElementById('app-view').style.display = 'none'
        },500)
    }
}

document.getElementById('search').onclick =()=>{

}
document.getElementById('settings').onclick = ()=>{
    document.getElementById('home').click()
    setTimeout(()=>{
        taskmanager.executeApp(appmanager.AppId.settings)
    },600)
}
document.getElementById('taskmanager').onclick = ()=>{
    document.getElementById('home').click()
    setTimeout(()=>{
        taskmanager.executeApp(appmanager.AppId.taskmanager)
    },600)
}
document.getElementById('appstore').onclick = ()=>{
    document.getElementById('home').click()
    setTimeout(()=>{
        taskmanager.executeApp(appmanager.AppId.appstore)
    },600)
}

document.getElementById('search-input').oninput = (e)=>{
    if(e.target.value.length>1){
        let s = e.target.value
        let keys = Object.keys(appmanager.Apps)
        document.getElementById('app-view-right').innerText = ''
        for(let i=0;i<keys.length;i++){
            let k=appmanager.Apps[keys[i]].appname.toLowerCase().match(s)
            if(k && k.index!=-1){
                let ic,div = document.createElement('label')
                div.className = "app-view-obj flex-column obj-margin"
                if(appmanager.Apps[keys[i]].iconTpe == 'fa') {
                    ic = document.createElement('i')
                    ic.className = 'scale15 center ' + appmanager.Apps[keys[i]].iconSrc
                    ic.id = appmanager.Apps[keys[i]].appId+'-icon'
                }
                ic.onclick = (e)=>{
                    let id = e.target.id.split('-')[0]
                    document.getElementById('home').click()
                    setTimeout(()=>{
                        taskmanager.executeApp(id)
                    },500)
                }
                let n = document.createElement('label')
                n.innerText = appmanager.Apps[keys[i]].appname
                n.className = 'text-margin'
                n.style.maxWidth='70px'
                n.style.textAlign ='center'
                n.style.wordBreak='normal'
                div.append(ic,n)
                document.getElementById('app-view-right').append(div)
            }
        }
    }
    else{
        sys.initAppview()
    }
}

document.getElementById('time').onclick = ()=>{
    taskmanager.executeApp('oermfo3f')
}
document.getElementById('date').onclick = ()=>{
    taskmanager.executeApp('cal2f4f43')
}

