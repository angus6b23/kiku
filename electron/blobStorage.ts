/* eslint @typescript-eslint/no-var-requires: "off" */
const { ipcMain, app } = require('electron')
const path = require('path')
const fs = require('fs')

const downloadPath = path.join(app.findPath('userData'), '/download')
console.log(downloadPath)

ipcMain.on('delete-bolb', () => undefined)
