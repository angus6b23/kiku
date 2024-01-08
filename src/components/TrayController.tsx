import React, { useEffect, type ReactElement } from 'react'
import { selectPlayer } from '@/store/playerReducers'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { selectConfig } from '@/store/globalConfig'
import i18n from '@/js/i18n'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { ipcRenderer } = require('electron')

export default function TrayController(): ReactElement {
    const playerState = useSelector(selectPlayer)
    const config = useSelector(selectConfig)
    const { t } = useTranslation(['tray', 'common', 'menu'])

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

    const generateTranslation = () => {
        i18n.changeLanguage(config.ui.lang)
        return {
            Window: t('menu:Window'),
            File: t('menu:File'),
            Close: t('menu:Close'),
            Quit: t('menu:Quit'),
            Player: t('menu:Player'),
            PlayPause: t('menu:Play-/-pause'),
            NextSong: t('menu:Next-song'),
            PrevSong: t('menu:Previous-song'),
            Help: t('menu:Help'),
            About: t('menu:About'),
            SourceCode: t('menu:Browse-source-code'),
            Sponsor: t('menu:Sponsor'),
        }
    }

    useEffect(() => {
        const translation = generateTranslation()
        ipcRenderer.send('update-menu', JSON.stringify(translation))
    }, [config.ui.lang])
    return <></>
}
