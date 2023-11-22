import React, { type ReactElement } from 'react'
import { Button, Icon, f7 } from 'framework7-react'
import { useDispatch } from 'react-redux'
import {
    clearErrorItems,
    clearPlayedItems,
    clearAllItems,
    shuffleUnplayed,
} from '@/store/playlist'
import { setSong, stop } from '@/store/player'
import {useTranslation} from 'react-i18next'

export interface PlaylistControlBarProps {}

export default function PlaylistControlBar(): ReactElement {
    const dispatch = useDispatch()
    const {t} = useTranslation(['playlist']);

    const handleClearPlaylist = () => {
        f7.dialog.confirm(
              t('playlist:Are-you-sure-to-clear-the-playlist'),
              t('playlist:Clear-playlist'),
            () => {
                dispatch(clearAllItems())
                dispatch(setSong(undefined))
                dispatch(stop())
            }
        )
    }
    return (
        <>
            <div className="flex h-full justify-around items-center py-2 m-0 flex-wrap gap-2">
                <Button
                    className="m-0"
                    tooltip={t('playlist:Clear-Error-items')}
                    onClick={() => dispatch(clearErrorItems())}
                >
                    <Icon f7="flag_slash_fill"></Icon>
                </Button>
                <Button
                    className="m-0"
                    tooltip={t('playlist:Clear-played-items')}
                    onClick={() => dispatch(clearPlayedItems())}
                >
                    <Icon f7="flowchart_fill"></Icon>
                </Button>
                <Button
                    className="m-0"
                    tooltip={t('playlist:Shuffle-unplayed-items')}
                    onClick={() => dispatch(shuffleUnplayed())}
                >
                    <Icon f7="shuffle"></Icon>
                </Button>
                <Button
                    className="m-0"
                    tooltip={t('playlist:Clear-playlist')}
                    onClick={handleClearPlaylist}
                >
                    <Icon f7="trash"></Icon>
                </Button>
            </div>
        </>
    )
}
