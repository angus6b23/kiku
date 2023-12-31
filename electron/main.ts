/* eslint-disable */
const path = require('path')
const fs = require('fs')
const os = require('node:os')
const du = require('du')
const Readable = require('stream').Readable
const { app, BrowserWindow, session, ipcMain } = require('electron')
const serve = require('electron-serve')
const loadURL = serve({ directory: 'dist' })

async function base64ToBlob(data) {
    const base64Response = await fetch(data)
    return await base64Response.blob()
}
let win
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

            // YouTube throttles the adaptive formats if you request a chunk larger than 10MiB.
            // For the DASH formats we are fine as video.js doesn't seem to ever request chunks that big.
            // The legacy formats don't have any chunk size limits.
            // For the audio formats we need to handle it ourselves, as the browser requests the entire audio file,
            // which means that for most videos that are longer than 10 mins, we get throttled, as the audio track file sizes surpass that 10MiB limit.

            // This code checks if the file is larger than the limit, by checking the `clen` query param,
            // which YouTube helpfully populates with the content length for us.
            // If it does surpass that limit, it then checks if the requested range is larger than the limit
            // (seeking right at the end of the video, would result in a small enough range to be under the chunk limit)
            // if that surpasses the limit too, it then limits the requested range to 10MiB, by setting the range to `start-${start + 10MiB}`.
            if (url.includes('&mime=audio') && requestHeaders.Range) {
                const TEN_MIB = 10 * 1024 * 1024
                const contentLength = parseInt(
                    new URL(url).searchParams.get('clen')
                )

                if (contentLength > TEN_MIB) {
                    const [startStr, endStr] =
                        requestHeaders.Range.split('=')[1].split('-')

                    const start = parseInt(startStr)

                    // handle open ended ranges like `0-` and `1234-`
                    const end =
                        endStr.length === 0 ? contentLength : parseInt(endStr)

                    if (end - start > TEN_MIB) {
                        const newEnd = start + TEN_MIB

                        requestHeaders.Range = `bytes=${start}-${newEnd}`
                    }
                }
            }

            callback({ requestHeaders })
        }
    )

    if (process.env.NODE_ENV === 'development') {
        win.loadURL('http://localhost:5201')
    } else {
        win.loadURL('app://-')
        // win.loadFile(`${__dirname}/../dist/index.html`)
    }

    // Open the DevTools.
    if (process.env.NODE_ENV === 'development') {
        win.webContents.openDevTools()
    }
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
ipcMain.on('create-blob', async (e, data) => {
    const extension = data.extension.includes('mp4') ? 'm4a' : 'opus'
    const base64Audio = data.blob.split(';base64,').pop()
    fs.promises
        .writeFile(`${downloadPath}/${data.id}.${extension}`, base64Audio, {
            encoding: 'base64',
        })
        .then(sendDirSize)
})
ipcMain.on('delete-blob', (_, data) => {
    const extension = data.extension.includes('mp4') ? 'm4a' : 'opus'
    fs.promises
        .rm(path.join(downloadPath, `${data.id}.${extension}`))
        .catch()
        .finally(sendDirSize)
})
ipcMain.handle('get-blob', async (_, id) => {
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
    return downloadPath
})
ipcMain.handle('get-folder-content', async () => {
    return await fs.promises.readdir(downloadPath)
})
