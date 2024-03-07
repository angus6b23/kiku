/* eslint-disable @typescript-eslint/no-var-requires */
const { Menu, shell, ipcMain } = require('electron')
const { get: t } = require('./translation.js')

const init = async (win) => {
    // Create menu with 'en' on startup
    const menu = Menu.buildFromTemplate(await createMenuTemplate(win))
    Menu.setApplicationMenu(menu)
    
    // Create a listener for listening on update-locale channel, replace the current menu with new locale upon triggered
    ipcMain.on('update-locale', async (_, newLocale) => {
        const newMenu = Menu.buildFromTemplate(await createMenuTemplate(win, newLocale));
        Menu.setApplicationMenu(newMenu)
    })
}

const createMenuTemplate = async (win, lang = 'en') => {
    return [
        {
            label: await t('electron:Window', lang),
            submenu: [
                { role: 'reload', label: await t('electron:Reload') },
                { role: 'forceReload', label: await t('electron:Force-reload') },
                { type: 'separator' },
                { role: 'toggleDevTools' },
                { role: 'togglefullscreen' },
                { type: 'separator' },
                {
                    label: await t('electron:Close', lang),
                    role: 'close',
                },
                {
                    label: await t('electron:Quit', lang),
                    role: 'quit',
                },
            ],
        },
        {
            label: await t('electron:Player', lang),
            submenu: [
                {
                    label: await t('electron:Play-Pause', lang),
                    click: () => {
                        win.webContents.send('tray-play-pause')
                    },
                },
                {
                    label: await t('electron:Next-Song', lang),
                    click: () => {
                        win.webContents.send('tray-next')
                    },
                },
                {
                    label: await t('electron:Prev-Song', lang),
                    click: () => {
                        win.webContents.send('tray-prev')
                    },
                },
            ],
        },
        {
            role: 'help',
            label: await t('electron:Help', lang),
            submenu: [
                {
                    label: await t('electron:About', lang),
                },
                {
                    label: await t('electron:Browse-Source-Code', lang),
                    click: () => {
                        shell.openExternal('https://github.com/angus6b23/kiku')
                    },
                },
                {
                    label: await t('electron:Support-this-project', lang),
                    click: () => {
                        shell.openExternal('https://liberapay.com/12a.app/')
                    },
                },
            ],
        },
    ]
}

module.exports = {
    init,
}
