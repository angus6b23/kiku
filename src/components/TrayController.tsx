import React, { useEffect, type ReactElement } from 'react'
import { selectPlayer } from '@/store/playerReducers'
import { useSelector } from 'react-redux'
import { selectConfig } from '@/store/globalConfig'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { ipcRenderer } = require('electron')

export default function TrayController(): ReactElement {
    const playerState = useSelector(selectPlayer)
    const config = useSelector(selectConfig)

    useEffect(() => {
        if (
            playerState.currentPlaying !== undefined &&
            playerState.status !== 'stopped'
        ) {
            ipcRenderer.send('update-tray-status', {
                newStatus: 'Now-Playing',
                currSong: playerState.currentPlaying.title,
            })
        } else {
            ipcRenderer.send('update-tray-status', {
                newStatus: 'Default-tooltip',
            })
        }
    }, [playerState.status, playerState.currentPlaying?.title])

    const sendQuitSignal = () => {
        if (!config.ui.hideOnClose) {
            ipcRenderer.send('quit-app')
        }
    }
    useEffect(() => {
        ipcRenderer.on('win-close', sendQuitSignal)
        return () => {
            ipcRenderer.off('win-close', sendQuitSignal)
        }
    }, [config.ui.hideOnClose])

    useEffect(() => {
        ipcRenderer.send('update-locale', config.ui.lang)
    }, [config.ui.lang])
    return <></>
}
