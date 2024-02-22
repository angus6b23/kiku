/* eslint-disable @typescript-eslint/no-var-requires */
const { ipcMain, app } = require('electron')
const path = require('path');
const fs = require('fs');
const du = require('du');


const init = (win) => {
    // Blob storage
    const downloadPath = path.join(app.getPath('userData'), '/download')

    // Create folder if not present
    fs.promises
        .readdir(downloadPath)
        .then()
        .catch(() => {
            fs.promises.mkdir(downloadPath)
        })

    const sendDirSize = async () => {
        const dirSize = await du(downloadPath)
        win.webContents.send('dir-size', dirSize)
    }

    // IPC channels used for creating and removing audio files
    ipcMain.on('create-blob', async (_, data) => {
        // Create audio files in the download folder with the data passed
        const extension = data.extension.includes('mp4') ? 'm4a' : 'opus'
        const base64Audio = data.blob.split(';base64,').pop()
        fs.promises
            .writeFile(`${downloadPath}/${data.id}.${extension}`, base64Audio, {
                encoding: 'base64',
            })
            .then(sendDirSize)
    })
    ipcMain.on('delete-blob', (_, data) => {
        // Remove the audio file with given audio file name
        const extension = data.extension.includes('mp4') ? 'm4a' : 'opus'
        fs.promises
            .rm(path.join(downloadPath, `${data.id}.${extension}`))
            .catch()
            .finally(sendDirSize)
    })
    ipcMain.handle('get-blob', async (_, id) => {
        // Read the audio file with given name then send back the data via ipc channel
        const folder = await fs.promises.readdir(downloadPath)
        const fileMatch = folder.find((file) => file.includes(id))
        if (fileMatch !== undefined) {
            const targetFile = await fs.promises.readFile(
                path.join(downloadPath, fileMatch)
            )
            return {
                exist: true,
                data:
                `data:audio/${fileMatch.replace(/^.*\./, '')}` +
                ';base64,' +
                targetFile.toString('base64'),
            }
        } else {
            return {
                exist: false,
                data: undefined,
            }
        }
    })
    ipcMain.handle('get-folder-path', () => {
        // Return the download path
        return downloadPath
    })
    ipcMain.handle('get-folder-content', async () => {
        // Get all file names in the download folder
        return await fs.promises.readdir(downloadPath)
    })
}

module.exports = {
    init
}
