/**
 * @name Emoji-DL
 * @invite S22r5H3a2W
 * @authorLink https://precious.codes
 * @website https://github.com/PreciousWarrior/BetterDiscordPlugins/tree/master/plugins/Emoji-DL
 * @source https://raw.githubusercontent.com/PreciousWarrior/BetterDiscordPlugins/tree/master/plugins/Emoji-DL/Emoji-DL.plugin.js
 */
/*@cc_on
@if (@_jscript)
    
    // Offer to self-install for clueless users that try to run this directly.
    var shell = WScript.CreateObject("WScript.Shell");
    var fs = new ActiveXObject("Scripting.FileSystemObject");
    var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\\BetterDiscord\\plugins");
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

module.exports = (() => {
    const config = {"info":{"name":"Emoji-DL","authors":[{"name":"IamPrecious","discord_id":"474898418138087428","github_username":"PreciousWarrior"}],"version":"0.0.1","description":"A plugin to download all emojis from a server into a ZIP file"},"changelog":[{"title":"Created Plugin","items":["Created this plugin!"]}],"main":"index.js"};

    return !global.ZeresPluginLibrary ? class {
        constructor() {this._config = config;}
        getName() {return config.info.name;}
        getAuthor() {return config.info.authors.map(a => a.name).join(", ");}
        getDescription() {return config.info.description;}
        getVersion() {return config.info.version;}
        load() {
            BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
                confirmText: "Download Now",
                cancelText: "Cancel",
                onConfirm: () => {
                    require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (error, response, body) => {
                        if (error) return require("electron").shell.openExternal("https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");
                        await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
                    });
                }
            });
        }
        start() {}
        stop() {}
    } : (([Plugin, Api]) => {
        const plugin = (Plugin, Library) => {
  const {
    Logger,
    DiscordAPI,
    DiscordContextMenu,
    Patcher,
    WebpackModules,
    Toasts,
    PluginUtilities,
    Settings,
  } = Library;
  const https = require("https");
  const fs = require("fs");
  const { join } = require("path");
  const { homedir } = require("os");

  return class EmojiDL extends Plugin {
    getName() {
      return "Emoji-DL";
    }
    onStart() {
      this.patchGuildContextMenu();
    }
    onStop() {
      Patcher.unpatchAll();
    }
    getSaveFilePath() {
      return (
        BdApi.loadData(this.getName(), "saveLocation") ||
        join(homedir(), "Desktop")
      );
    }
    getSettingsPanel() {
      return new Settings.SettingPanel()
        .append(
          new Settings.Textbox(
            this.strings.saveSettingTitle,
            this.strings.saveSettingDescription,
            this.getSaveFilePath(),
            (text) => {
              this.changeSetting("saveLocation", text);
            }
          )
        )
        .getElement();
    }
    changeSetting(id, data) {
      PluginUtilities.saveData(this.getName(), id, data);
    }
    handleMenuItemClick = async (discordGuildObj) => {
      Logger.log("Saving emojis for guild: " + discordGuildObj.id);
      Toasts.info(
        this.strings.downloadingToast.replace("$GUILD", discordGuildObj.name)
      );
      const zereGuildObj = new DiscordAPI.Guild(discordGuildObj);
      const savePath = join(
        this.getSaveFilePath(),
        "Emoji-DL",
        discordGuildObj.name.split("/").join("∕")
      );
      fs.mkdirSync(savePath, { recursive: true });
      for (const emoji of zereGuildObj.emojis.map(
        (emoji) => emoji.discordObject
      )) {
        Logger.log("Got emoji object: ", emoji);
        const filePath = join(
          savePath,
          `${emoji.name.split("/").join("∕")}.${new URL(emoji.url).pathname
            .split(".")
            .pop()}`
        );
        try {
          await this.saveEmoji(filePath, emoji.url);
          Logger.log("Successfully saved emoji at " + filePath);
        } catch (error) {
          Logger.log(`Error saving emoji ${emoji.id}: ${error}`);
        }
      }
      Toasts.success(this.strings.downloadedToast.replace("$PATH", savePath));
    };

    async saveEmoji(dest, url) {
      return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest, { flags: "wx" });
        const request = https.get(url, (response) => {
          if (response.statusCode === 200) {
            response.pipe(file);
          } else {
            file.close();
            fs.unlink(dest, () => {}); // Delete temp file
            reject(
              `Server responded with ${response.statusCode}: ${response.statusMessage}`
            );
          }
        });

        request.on("error", (err) => {
          file.close();
          fs.unlink(dest, () => {}); // Delete temp file
          reject(err.message);
        });

        file.on("finish", () => {
          resolve();
        });

        file.on("error", (err) => {
          file.close();

          if (err.code === "EEXIST") {
            reject("File already exists");
          } else {
            fs.unlink(dest, () => {}); // Delete temp file
            reject(err.message);
          }
        });
      });
    }

    patchGuildContextMenu() {
      const GuildContextMenu = WebpackModules.getModule(
        (m) => m.default && m.default.displayName == "GuildContextMenu"
      );

      Patcher.after(GuildContextMenu, "default", (_, [props], retVal) => {
        const categoryIndex = 3;

        const original = retVal.props.children[categoryIndex].props.children;
        const newOne = DiscordContextMenu.buildMenuItem({
          label: this.strings.contextMenuLabel,
          action: () => {
            this.handleMenuItemClick(props.guild);
          },
        });
        if (Array.isArray(original)) {
          const itemIndex = original.length;
          original.splice(itemIndex, 0, newOne);
        } else retVal.props.children[0].props.children = [original, newOne];
      });
    }

    strings = {
      contextMenuLabel: "Export Emojis",
      downloadingToast: "Downloading all emojis for $GUILD...",
      downloadedToast: "Downloaded all emojis to $PATH",
      saveSettingTitle: "Save location",
      saveSettingDescription:
        "The path to save emojis at. Defaults to your desktop.",
    };
  };
};
        return plugin(Plugin, Api);
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/