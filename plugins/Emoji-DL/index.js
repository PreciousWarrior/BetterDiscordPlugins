module.exports = (Plugin, Library) => {
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
