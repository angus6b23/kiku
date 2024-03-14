/* eslint-disable @typescript-eslint/no-var-requires */
const { Tray, Menu, ipcMain } = require('electron')
const { get: t } = require('./translation')

const init = async ({ win, root, quitApp }) => {
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
    const generateTrayMenuTemplate = async (lang = 'en') => {
        return [
            { label: await t('tray:Hide-Show', lang), click: toggleWinDisplay },
            { type: 'separator' },
            {
                label: await t('tray:Play-Pause', lang),
                click: () => {
                    win.webContents.send('tray-play-pause')
                },
            },
            {
                label: await t('tray:Next-song', lang),
                click: () => {
                    win.webContents.send('tray-next')
                },
            },
            {
                label: await t('tray:Previous-song', lang),
                click: () => {
                    win.webContents.send('tray-prev')
                },
            },
            { type: 'separator' },
            {
                label: await t('tray:Quit', lang),
                click: quitApp,
            },
        ]
    }
    const trayMenu = Menu.buildFromTemplate(await generateTrayMenuTemplate())
    tray.setContextMenu(trayMenu)

    // IPC channel for controlling tray tooltip and menu
    ipcMain.on('update-locale', async (_, newLang) => {
        lang = newLang
        // t('tray:Default-tooltip')
        // t('tray:Now-Playing')
        const newTooltip = await t(`tray:${status}`, lang)
        tray.setToolTip(newTooltip)
        const newTrayMenu = Menu.buildFromTemplate(await generateTrayMenuTemplate(newLang))
        tray.setContextMenu(newTrayMenu)
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
