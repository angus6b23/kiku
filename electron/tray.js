/* eslint-disable @typescript-eslint/no-var-requires */
const { Tray, Menu, ipcMain } = require('electron')
const { get: t } = require('./translation')

const init = ({ win, root, quitApp }) => {
    let tray
    let lang = 'en'
    let status = 'Default-tooltip'

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

    // IPC channel for controlling tray tooltip and menu
    ipcMain.on('update-locale', async (_, newLang) => {
        lang = newLang
        const newTooltip = await t(`tray:${status}`, lang)
        tray.setToolTip(newTooltip)
    })

    ipcMain.on('update-tray-status', async (_, { newStatus, currSong }) => {
        status = newStatus
        const newTooltip = await t(`tray:${status}`, lang)
        if (currSong) {
            tray.setToolTip(`${newTooltip}\n${currSong}`)
        } else {
            tray.setToolTip(newTooltip)
        }
    })
}

module.exports = {
    init,
}
