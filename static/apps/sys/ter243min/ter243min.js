document.getElementById('ter243min-minimize').onclick = ()=>{
    sys.minimizeApp('ter243min')
}
document.getElementById('ter243min-close').onclick=()=>{
    cmdline.session={}
    taskmanager.KillApp('ter243min')
}
let ter243min_user = 'Guest'
let ter243min_count = 0
let ter243min_CmdHistory = []
let ter243min_ssid=0
let ter243min_pointer=ter243min_CmdHistory.length-1
function ter243min_init() {
    cmdline.createSession()
    if (user.IsloggedIn()){
        ter243min_user = user.getName()
    }
    let ter243min_lab = document.createElement('label')
    ter243min_lab.innerText = "WebOS v1.0.0\n\nCLI interface designed for the webOS.\n\n"
    document.getElementById('ter243min-main-page').append(ter243min_lab)
}

function ter243min_addconsole(){
    try {
        document.getElementById('ter243min_input'+ter243min_count).disabled=true
    }
    catch (e){}
    //add the output lines here
    let ter243min_div = document.createElement('div')
    let ter243min_lab = document.createElement('label')
    let ter243min_input = document.createElement('input')
    ter243min_div.className = 'ter243min_div'
    ter243min_lab.className = 'ter243min_lab'
    ter243min_count++;
    ter243min_input.id = 'ter243min_input'+ter243min_count
    ter243min_input.addEventListener('keydown',async (e)=>{
        if (e.key=='Enter') {
            ter243min_CmdHistory.push(e.target.value)
            await ter243min_process_console(e.target.value)
            ter243min_addconsole()
        }
    })
    ter243min_input.className = 'ter243min_console_input'
    ter243min_lab.innerText=ter243min_user+`@${cmdline.session.cwd}>> `
    ter243min_div.append(ter243min_lab,ter243min_input)
    document.getElementById('ter243min-main-page').append(ter243min_div)
    ter243min_input.focus()
}
async function ter243min_process_console(input){
    let ter243minlbl = await cmdline.processInput(input)
    let ter243min_v = document.createElement('label')
    if (ter243minlbl.status==1 && ter243minlbl.msg.length >0) {
        ter243min_v.innerHTML = ter243minlbl.msg
        document.getElementById('ter243min-main-page').append(ter243min_v)
    }
}

document.onkeydown = (e)=>{
    if(e.key=='ArrowUp'){

    }
    else if(e.key=='ArrowDown'){

    }
}
ter243min_init()
ter243min_addconsole()