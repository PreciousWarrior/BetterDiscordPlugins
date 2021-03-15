/**
 * @name NitroStream
 * @version 0.0.1
 * @description Stream at 1080p60 or at source resolution without nitro!
 * @author IamPrecious
 * @authorId 474898418138087428
 * @authorLink https://github.com/PreciousWarrior
 * @source https://raw.githubusercontent.com/PreciousWarrior/BetterDiscordPlugins/main/NitroStream/NitroStream.plugin.js
 * @updateUrl https://raw.githubusercontent.com/PreciousWarrior/BetterDiscordPlugins/main/NitroStream/NitroStream.plugin.js
 * @website https://github.com/PreciousWarrior/BetterDiscordPlugins/tree/main/NitroStream
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
 

module.exports = class NitroStream {
    originalType;
    load() {}

    start() {
        const userStore = BdApi.findModuleByProps("getCurrentUser");
        const user = userStore.getCurrentUser();
        this.originalType = user.premiumType;
        user.premiumType = 2;
    }

    stop(){
        const userStore = BdApi.findModuleByProps("getCurrentUser");
        const user = userStore.getCurrentUser();
        user.premiumType = this.originalType
    }
}

//Stupidly simple.