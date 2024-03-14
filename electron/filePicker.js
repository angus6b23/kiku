/* eslint-disable @typescript-eslint/no-var-requires */

const { dialog, ipcMain } = require('electron')
const fs = require('fs')
const Papa = require('papaparse')

const showFileDialog = async (type, extension) => {
    try {
        const playlistFile = await dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [
                { name: `${type} Playlist`, extensions: [extension] },
                { name: 'All Files', extensions: ['*'] },
            ],
        })
        if (playlistFile.canceled) {
            return undefined
        }
        const fileContent = await fs.promises.readFile(
            playlistFile.filePaths[0],
            { encoding: 'utf8' }
        )
        return fileContent
    } catch (e) {
        console.error('electron file picker' + e.message)
        return e
    }
}

const pickFreetubePlaylist = async () => {
    try {
        const readFile = await showFileDialog('Freetube', 'db')
        if (readFile === undefined) {
            return undefined
        } else if (readFile instanceof Error) {
            throw readFile
        } else {
            const ftPlaylists = JSON.parse(readFile)
            return ftPlaylists
        }
    } catch (err) {
        console.error(err)
        return new Error(err)
    }
}

const pickYoutubePlaylist = async () => {
    try {
        const readFile = await showFileDialog('Youtube', 'csv')
        if (readFile === undefined) {
            return undefined
        } else if (readFile instanceof Error) {
            throw readFile
        } else {
            let ytPlaylists = Papa.parse(readFile)
            ytPlaylists = ytPlaylists.data.map(([id, timeStamp], index) =>
                index === 0 ? '' : id.trim()
            ) // Extract data from csv, ignore first row for headers, only preserve ids (first field) for other rows
            ytPlaylists = ytPlaylists.filter((id) => id !== '') // Filter out rows with empty ids
            return ytPlaylists
        }
    } catch (err) {
        console.error(err)
        return new Error(err)
    }
}

const init = () => {
    ipcMain.handle('pickFreetubePlaylist', pickFreetubePlaylist)
    ipcMain.handle('pickYoutubePlaylist', pickYoutubePlaylist)
}
module.exports = {
    pickFreetubePlaylist,
    init,
}
