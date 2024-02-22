/* eslint-disable */
const path = require('path')
const fs = require('fs')
const du = require('du')
const filePicker = require('./filePicker')
const blobStorage = require('./blobStorage')

const root = path.join(__dirname, '../dist')
const {
    app,
    BrowserWindow,
    session,
    ipcMain,
    Tray,
    Menu,
    shell,
} = require('electron')
// const serve = require('electron-serve')
// const loadURL = serve({ directory: 'dist' })

let win, tray
let appQuiting = false

const quitApp = () => {
    appQuiting = true
    app.quit()
}
app.on('before-quit', quitApp)
function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({
        autoHideMenuBar: true,
        icon: `${root}/icons/png/256x256.png`,
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
            win.webContents.send('win-close') // Send signal to renderer to check if minimie to tray is active
            win.hide()
        }
    })

    ipcMain.on('quit-app', quitApp) // Renderer will send back quit-app signal if minimize to tray is not active
    // Create tray icon
    const toggleWinDisplay = () => {
        win.isVisible() ? win.hide() : win.show()
    }
    if (process.env.NODE_ENV === 'developement') {
        tray = new Tray('public/icons/png/256x256.png')
    } else {
        tray = new Tray(`${root}/icons/png/256x256.png`)
    }
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
            click: quitApp,
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

blobStorage.init()


// IPC channel for controlling tray tooltip and menu
ipcMain.on('update-tray-tooltip', (_, newInfo) => {
    tray.setToolTip(newInfo)
})

// IPC channel for controlling custom menu
ipcMain.on('update-menu', (_, json) => {
    const translation = JSON.parse(json)
    const menuTemplate = [
        {
            label: translation['Window'],
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { type: 'separator' },
                { role: 'toggleDevTools' },
                { role: 'togglefullscreen' },
                { type: 'separator' },
                {
                    label: translation['Close'],
                    role: 'close',
                },
                {
                    label: translation['Quit'],
                    role: 'quit',
                },
            ],
        },
        {
            label: translation['Player'],
            submenu: [
                {
                    label: translation['PlayPause'],
                    click: () => {
                        win.webContents.send('tray-play-pause')
                    },
                },
                {
                    label: translation['NextSong'],
                    click: () => {
                        win.webContents.send('tray-next')
                    },
                },
                {
                    label: translation['PrevSong'],
                    click: () => {
                        win.webContents.send('tray-prev')
                    },
                },
            ],
        },
        {
            role: 'help',
            label: translation['Help'],
            submenu: [
                {
                    label: translation['About'],
                },
                {
                    label: translation['SourceCode'],
                    click: () => {
                        shell.openExternal('https://github.com/angus6b23/kiku')
                    },
                },
                {
                    label: translation['Sponsor'],
                    click: () => {
                        shell.openExternal('https://liberapay.com/12a.app/')
                    },
                },
            ],
        },
    ]
    const menu = Menu.buildFromTemplate(menuTemplate)
    Menu.setApplicationMenu(menu)
})

filePicker.init()
