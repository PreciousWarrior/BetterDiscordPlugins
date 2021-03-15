 /** 
 * @name UseWithoutInternet
 * @version 0.0.1
 * @description Does not start the loading page when internet access is unavailable. You can view cached messages, profiles, etc. on Discord even with no active internet connection.
 * @author IamPrecious
 * @authorId 474898418138087428
 * @authorLink https://github.com/PreciousWarrior
 * @source https://raw.githubusercontent.com/PreciousWarrior/BetterDiscordPlugins/main/UseWithoutInternet/UseWithoutInternet.plugin.js
 * @updateUrl https://raw.githubusercontent.com/PreciousWarrior/BetterDiscordPlugins/main/UseWithoutInternet/UseWithoutInternet.plugin.js
 * @website https://github.com/PreciousWarrior/BetterDiscordPlugins/tree/main/UseWithoutInternet
 */ 

/*@cc_on
@if (@_jscript)
	
	// Offer to self-install for clueless users that try to run this directly.
	var shell = WScript.CreateObject("WScript.Shell");
	var fs = new ActiveXObject("Scripting.FileSystemObject");
	var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\BetterDiscord\plugins");
	var pathSelf = WScript.ScriptFullName;
	// Put the user at ease by addressing them in the first person
	shell.Popup("It looks like you've mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
	if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
		shell.Popup("I'm in the correct folder already.", 0, "I'm already installed", 0x40);
	} else if (!fs.FolderExists(pathPlugins)) {
		shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
	} else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
		fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
		// Show the user where to put plugins in the future
		shell.Exec("explorer " + pathPlugins);
		shell.Popup("I'm installed!", 0, "Successfully installed", 0x40);
	}
	WScript.Quit();

@else@*/
const time = 100 //ms to check for loading screen

var timeout;
var connected = true;

class UseWithoutInternet {

    load(){}

    start(){
        if (!global.ZeresPluginLibrary) return window.BdApi.alert("Library Missing",`The library plugin needed for ${this.getName()} is missing.<br /><br /> <a href="https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js" target="_blank">Click here to download the library!</a>`);
        timeout = setTimeout(KillLoadingPage, 2000) //wait for discord to load up everything
    }

    stop(){
        clearTimeout(timeout)

    }
}


function KillLoadingPage(){

    var app = document.getElementsByClassName("app-1q1i1E da-app")[0];
    var noConnectionElement;
    for (var i = 0; i < app.children.length; i++) {
        //identifies the correct element via the opacity style (because the classes are removed by this plugin)
        if (app.children[i].getAttribute("style") == "opacity: 1;"){
            noConnectionElement = app.children[i]
        }
    }

    if (!noConnectionElement){
        //Internet is working fine.
        if (!connected){
            connected = true;
            return ZLibrary.Toasts.success("Internet Connection restored!")
        }
        return timeout = setTimeout(KillLoadingPage, time);
    }
    if (noConnectionElement.classList == "container-16j22k fixClipping-3qAKRb da-container da-fixClipping"){
        //internet is not working fine. Discord has popped up the unremovable no connection barrier.

        const removeChilds = (parent) =>{
            while (parent.lastChild){
                parent.removeChild(parent.lastChild)
            }
        };

        //kills children (master skywalker, there are too many of them!) of the loading page element and removes all classes;
        //because killing the element itself causes an error when discord
        //tries to kill it itself when internet connection is regained.
    
        connected = false;
        removeChilds(noConnectionElement)
        noConnectionElement.classList = ""
        ZLibrary.Toasts.warning("Internet connection disconnected.")
        return  timeout = setTimeout(KillLoadingPage, time)

    }
    //internet is not working fine, but the plugin has removed the offending loading screen and no action needs to be taken here.
    return timeout = setTimeout(KillLoadingPage, time)

}
