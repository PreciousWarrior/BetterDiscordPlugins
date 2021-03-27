 /** 
 * @name UseWithoutInternet
 * @version 0.0.2
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

module.exports = class UseWithoutInternet {
    load(){
        if (!global.ZeresPluginLibrary) return window.BdApi.alert("Library Missing",`The library plugin needed for UseWithoutInternet is missing.<br /><br /> <a href="https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js" target="_blank">Click here to download the library!</a>`);
        ZLibrary.PluginUpdater.checkForUpdate("UseWithoutInternet", "0.0.2", "https://raw.githubusercontent.com/PreciousWarrior/BetterDiscordPlugins/main/UseWithoutInternet/UseWithoutInternet.plugin.js");
    }
    start(){}
    stop(){}
    observer(changes){

        if (changes.addedNodes && changes.addedNodes.length != 0 && changes.addedNodes[0].classList == "container-16j22k fixClipping-3qAKRb da-container da-fixClipping"){
            //internet is not working fine. Discord has popped up the unremovable no connection barrier.
            const removeChilds = (parent) =>{
                while (parent.lastChild){
                    parent.removeChild(parent.lastChild)
                }
            };
            removeChilds(changes.addedNodes[0])
            changes.addedNodes[0].classList = "betterdiscord-usewithoutinternet-borked"

            //kills children (master skywalker, there are too many of them!) of the loading page element and removes all classes;
            //because killing the element itself causes an error when discord
            //tries to kill it itself when internet connection is regained

            return ZLibrary.Toasts.warning("Internet connection disconnected!")

        }

        if (changes.removedNodes && changes.removedNodes.length != 0 && changes.removedNodes[0].classList == "betterdiscord-usewithoutinternet-borked"){
            //Internet is now working fine, discord has removed the loading screen from their side.
            return ZLibrary.Toasts.success("Internet connection is back!");
        }
        
    }
}

