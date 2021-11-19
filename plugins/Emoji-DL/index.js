module.exports = (Plugin, Library) => {
    const {
        DiscordAPI,
        DiscordContextMenu,
        Patcher,
        WebpackModules,
        Toasts,
        PluginUtilities,
        Settings,
    } = Library
    const https = require('https')
    const fs = require('fs')
    const { join } = require('path')
    const { homedir } = require('os')

    return class EmojiDL extends Plugin {
        getName() {
            return 'Emoji-DL'
        }
        onStart() {
            this.patchGuildContextMenu()
        }
        onStop() {
            Patcher.unpatchAll()
        }
        getSaveFilePath() {
            return (
                BdApi.loadData(this.getName(), 'saveLocation') ??
                join(homedir(), 'Pictures')
            )
        }
        getSettingsPanel() {
            return new Settings.SettingPanel()
                .append(
                    new Settings.Textbox(
                        this.strings.saveSettingTitle,
                        this.strings.saveSettingDescription,
                        this.getSaveFilePath(),
                        (text) => {
                            this.changeSetting('saveLocation', text)
                        }
                    )
                )
                .getElement()
        }
        changeSetting(id, data) {
            PluginUtilities.saveData(this.getName(), id, data)
        }
        handleMenuItemClick = async (discordGuildObj) => {
            console.log('Saving emojis for guild: ' + discordGuildObj.id)
            const zereGuildObj = new DiscordAPI.Guild(discordGuildObj)
            const savePath = join(
                this.getSaveFilePath(),
                discordGuildObj.name.split('/').join('∕') //replaces slashes with unicode character
            )
            BdApi.showConfirmationModal(
                'Save emojis',
                `Are you sure you want to save all emojis for ${discordGuildObj.name} to ${savePath}?`,
                {
                    confirmText: this.strings.confirmText,
                    cancelText: this.strings.cancelText,
                    onConfirm: () => {
                        Toasts.info(
                            this.strings.downloadingToast.replace(
                                '$GUILD',
                                discordGuildObj.name
                            )
                        )
                        this.saveEmojis(
                            this.undupeEmojis(
                                zereGuildObj.emojis.map(
                                    (emoji) => emoji.discordObject
                                )
                            ),
                            savePath
                        )
                    },
                }
            )
        }

        getEmojiName(name, numberOfDuplicates) {
            if (numberOfDuplicates === 0) {
                return name
            }
            return name + '~' + numberOfDuplicates
        }
        undupeEmojis(emojis) {
            const emojiNames = []
            for (const emoji of emojis) {
                let numberOfDuplicates = 0
                while (true) {
                    if (
                        emojiNames.indexOf(
                            this.getEmojiName(emoji.name, numberOfDuplicates)
                        ) > -1
                    ) {
                        numberOfDuplicates++
                    } else break
                }
                emoji.name = this.getEmojiName(emoji.name, numberOfDuplicates)
                emojiNames.push(emoji.name)
            }
            return emojis
        }

        async saveEmojis(emojis, path) {
            fs.mkdirSync(path, { recursive: true })
            const promises = []
            for (const emoji of emojis) {
                const fileName = emoji.name.split('/').join('∕') //replace slashes with unicode character
                const fileExtension = new URL(emoji.url).pathname
                    .split('.')
                    .pop() // gets the file extension of the emojis via URL
                const filePath = join(path, fileName + '.' + fileExtension)
                promises.push(this.download(emoji.url, filePath))
            }
            try {
                await Promise.all(promises)
            } catch (error) {
                BdApi.alert(
                    this.strings.saveErrorTitle,
                    this.strings.saveErrorMessage
                )
                throw error
            }
            Toasts.success(this.strings.downloadedToast.replace('$PATH', path))
        }

        patchGuildContextMenu() {
            const GuildContextMenu = WebpackModules.getModule(
                (m) => m.default && m.default.displayName == 'GuildContextMenu'
            )

            Patcher.after(GuildContextMenu, 'default', (_, [props], retVal) => {
                const categoryIndex = 3

                const original =
                    retVal.props.children[categoryIndex].props.children
                const newOne = DiscordContextMenu.buildMenuItem({
                    label: this.strings.contextMenuLabel,
                    action: () => {
                        this.handleMenuItemClick(props.guild)
                    },
                })
                if (Array.isArray(original)) {
                    const itemIndex = original.length
                    original.splice(itemIndex, 0, newOne)
                } else
                    retVal.props.children[0].props.children = [original, newOne]
            })
        }

        //https://stackoverflow.com/a/45007624
        download(url, dest) {
            return new Promise((resolve, reject) => {
                const file = fs.createWriteStream(dest, { flags: 'wx' })

                const request = https.get(url, (response) => {
                    if (response.statusCode === 200) {
                        response.pipe(file)
                    } else {
                        file.close()
                        fs.unlink(dest, () => {}) // Delete temp file
                        reject(
                            `Server responded with ${response.statusCode}: ${response.statusMessage}`
                        )
                    }
                })

                request.on('error', (err) => {
                    file.close()
                    fs.unlink(dest, () => {}) // Delete temp file
                    reject(err.message)
                })

                file.on('finish', () => {
                    resolve()
                })

                file.on('error', (err) => {
                    file.close()

                    if (err.code === 'EEXIST') {
                        reject('File already exists')
                        console.log(dest)
                    } else {
                        fs.unlink(dest, () => {}) // Delete temp file
                        reject(err.message)
                    }
                })
            })
        }
        strings = {
            contextMenuLabel: 'Export Emojis',
            downloadingToast: 'Downloading all emojis for $GUILD...',
            downloadedToast: 'Downloaded all emojis to $PATH',
            saveSettingTitle: 'Save location',
            saveSettingDescription: 'The file path to save emojis at.',
            confirmText: 'Yes',
            cancelText: 'No',
            modalTitle: 'Save emojis',
            modalText:
                'Are you sure you want to save all emojis for $GUILD to $PATH?',
            saveErrorTitle: 'Emojis not saved',
            saveErrorMessage:
                'An error occoured when saving an emoji. Please check the console via ctrl+shift+I for the error message.',
        }
    }
}
