/* eslint-disable */
const path = require('path')
const fs = require('fs')
const os = require('node:os')
const du = require('du')
const Readable = require('stream').Readable
const {
    app,
    BrowserWindow,
    session,
    ipcMain,
    Tray,
    Menu,
    MenuItem,
} = require('electron')
const serve = require('electron-serve')
const loadURL = serve({ directory: 'dist' })

async function base64ToBlob(data) {
    const base64Response = await fetch(data)
    return await base64Response.blob()
}
let win, tray
let appQuiting = false
function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({
        autoHideMenuBar: true,
        icon: `${__dirname}/../public/icons/png/512x512.png`,
        webPreferences: {
            nodeIntegration: true,
            nodeIntegrationInWorker: false,
            webSecurity: false,
            backgroundThrottling: false,
            contextIsolation: false,
        },
    })

    // Set CONSENT cookie on reasonable domains
    const consentCookieDomains = [
        'https://www.youtube.com',
        'https://youtube.com',
    ]
    consentCookieDomains.forEach((url) => {
        session.defaultSession.cookies.set({
            url: url,
            name: 'CONSENT',
            value: 'YES+',
            sameSite: 'no_restriction',
        })
    })

    session.defaultSession.cookies.set({
        url: 'https://www.youtube.com',
        name: 'SOCS',
        value: 'CAI',
        sameSite: 'no_restriction',
    })

    // make InnerTube requests work with the fetch function
    // InnerTube rejects requests if the referer isn't YouTube or empty
    const innertubeAndMediaRequestFilter = {
        urls: [
            'https://www.youtube.com/youtubei/*',
            'https://*.googlevideo.com/videoplayback?*',
        ],
    }

    session.defaultSession.webRequest.onBeforeSendHeaders(
        innertubeAndMediaRequestFilter,
        ({ requestHeaders, url, resourceType }, callback) => {
            requestHeaders.Referer = 'https://www.youtube.com/'
            requestHeaders.Origin = 'https://www.youtube.com'

            if (url.startsWith('https://www.youtube.com/youtubei/')) {
                requestHeaders['Sec-Fetch-Site'] = 'same-origin'
            } else {
                // YouTube doesn't send the Content-Type header for the media requests, so we shouldn't either
                delete requestHeaders['Content-Type']
            }
            callback({ requestHeaders })
        }
    )

    // Load the page
    if (process.env.NODE_ENV === 'development') {
        win.loadURL('http://localhost:5201')
    } else {
        win.loadURL('app://-')
    }

    // Open the DevTools.
    if (process.env.NODE_ENV === 'development') {
        win.webContents.openDevTools()
    }

    // Control for minimize and exist
    win.on('close', function (event) {
        if (!appQuiting) {
            event.preventDefault()
            win.hide()
        }
    })

    // Create tray icon
    const toggleWinDisplay = () => {
        win.isVisible() ? win.hide() : win.show()
    }
    tray = new Tray('public/icons/png/256x256.png')
    tray.setToolTip('Kiku - a electron based youtube music player')
    tray.on('click', toggleWinDisplay)
    const trayMenuTemplate = [
        { label: 'Show / Hide App', click: toggleWinDisplay },
        { type: 'separator' },
        {
            label: 'Play / Pause',
            click: () => {
                win.webContents.send('tray-play-pause')
            },
        },
        {
            label: 'Next song',
            click: () => {
                win.webContents.send('tray-next')
            },
        },
        {
            label: 'Previous song',
            click: () => {
                win.webContents.send('tray-prev')
            },
        },
        { type: 'separator' },
        {
            label: 'Quit',
            click: function () {
                appQuiting = true
                app.quit()
            },
        },
    ]
    const trayMenu = Menu.buildFromTemplate(trayMenuTemplate)
    tray.setContextMenu(trayMenu)
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow)

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.

    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

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

// IPC channel for controlling tray tooltip and menu
ipcMain.on('update-tray-tooltip', (_, newInfo) => {
    tray.setToolTip(newInfo)
})
