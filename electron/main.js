/* eslint-disable */
const path = require('path')
const filePicker = require('./filePicker')
const tray = require('./tray')
const blobStorage = require('./blobStorage')
const menu = require('./menu')

const root = path.join(__dirname, '../dist')
const {
    app,
    BrowserWindow,
    session,
    ipcMain,
    Menu,
    shell,
} = require('electron')
const serve = require('electron-serve')
const loadURL = serve({ directory: 'dist' })

let win
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

    tray.init({
        win: win,
        root: root,
        quitApp: quitApp,
    })
    blobStorage.init(win)

    ipcMain.on('quit-app', quitApp) // Renderer will send back quit-app signal if minimize to tray is not active
    // Create tray icon
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

// IPC channel for controlling custom menu
menu.init()
filePicker.init()
