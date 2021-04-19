/**
 * @name RememberServerDMs
 * @version 0.0.1
 * @description Remembers the messages you draft in the server DM user popout
 * @author IamPrecious
 * @authorId 474898418138087428
 * @authorLink https://github.com/PreciousWarrior
 * @source https://raw.githubusercontent.com/PreciousWarrior/BetterDiscordPlugins/main/RememberServerDMs/RememberServerDMs.plugin.js
 * @updateUrl https://raw.githubusercontent.com/PreciousWarrior/BetterDiscordPlugins/main/RememberServerDMs/RememberServerDMs.plugin.js
 * @website https://github.com/PreciousWarrior/BetterDiscordPlugins/tree/main/RememberServerDMs
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

module.exports = class RememberServerDMs {
    load() { }
    start() { }
    stop() { }


    observer(changes) {
        let child;
        changes.addedNodes.forEach(node => {
            try {
                child = node.children[0].children[0]
            }
            catch (e) { return; }

        })
        if (!child) { return; }
        if (child.classList != BdApi.findModuleByProps("userPopout").userPopout) {
            return;
        }
        let input = child.children[2].children[0].children[0];
        let savedText = BdApi.loadData("RememberServerDMs", BdApi.getInternalInstance(child).stateNode.dataset.userId);
        if (savedText) {
            input.value = savedText
        }
        if (!input) { return; } //for your own user popout
        input.onchange = function (input) {
            let value = input.srcElement.value;
            let uid = BdApi.getInternalInstance(input.srcElement.parentElement.parentElement.parentElement).stateNode.dataset.userId;
            BdApi.saveData("RememberServerDMs", uid, value);
        }
    }
}