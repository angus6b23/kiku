/* eslint-disable @typescript-eslint/no-var-requires */

const { dialog, ipcMain } = require('electron')
const fs = require('fs')

const pickFreetubePlaylist = async () => {
    const playlistFile = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
            { name: 'Freetube playlist', extensions: ['db'] },
            { name: 'All Files', extensions: ['*'] },
        ],
    })
    if (playlistFile.canceled) {
        return undefined
    } else {
        try {
            const fileContent = await fs.promises.readFile(
                playlistFile.filePaths[0],
                { encoding: 'utf8' }
            )
            const ftPlaylists = JSON.parse(fileContent)
            return ftPlaylists
        } catch (err) {
            console.error(err)
            return new Error(err)
        }
    }
}
const init = () => {
    ipcMain.handle('pickFreetubePlaylist', async () => {
        const res = await pickFreetubePlaylist()
        return res
    })
}
module.exports = {
    pickFreetubePlaylist,
    init,
}
