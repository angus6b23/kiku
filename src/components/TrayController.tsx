import React, { useEffect, type ReactElement } from 'react'
import { selectPlayer } from '@/store/playerReducers'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { ipcRenderer } = require('electron')

export default function TrayController(): ReactElement {
    const playerState = useSelector(selectPlayer)
    const { t } = useTranslation(['tray', 'common'])

    useEffect(() => {
        if (
            playerState.currentPlaying !== undefined &&
            playerState.status !== 'stopped'
        ) {
            const newString = `${t('common:Now-Playing')}\n${
                playerState.currentPlaying.title
            }`
            ipcRenderer.send('update-tray-tooltip', newString)
        } else {
            const newString = t('tray:Default-tooltip')
            ipcRenderer.send('update-tray-tooltip', newString)
        }
    }, [playerState.status, playerState.currentPlaying?.title])
    return <></>
}
