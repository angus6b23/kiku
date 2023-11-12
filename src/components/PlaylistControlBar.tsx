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

export interface PlaylistControlBarProps {}

export default function PlaylistControlBar(): ReactElement {
    const dispatch = useDispatch()
    const handleClearPlaylist = () => {
        f7.dialog.confirm(
            'Are you sure to clear the whole playlist',
            'Kiku Clear Playlist',
            () => {
                console.log('clear all triggered')
                dispatch(clearAllItems())
                dispatch(setSong(undefined))
                dispatch(stop())
            }
        )
    }
    return (
        <>
            <div className="block h-full items-center p-2 m-0">
                <Button
                    className="inline-block"
                    tooltip="Clear Error videos"
                    onClick={() => dispatch(clearErrorItems())}
                >
                    <Icon f7="flag_slash_fill"></Icon>
                </Button>
                <Button
                    className="inline-block"
                    tooltip="Clear played videos"
                    onClick={() => dispatch(clearPlayedItems())}
                >
                    <Icon f7="flowchart_fill"></Icon>
                </Button>
                <Button
                    className="inline-block"
                    tooltip="Shuffle unplayed items"
                    onClick={() => dispatch(shuffleUnplayed())}
                >
                    <Icon f7="shuffle"></Icon>
                </Button>
                <Button
                    className="inline-block"
                    tooltip="Clear Playlist"
                    onClick={handleClearPlaylist}
                >
                    <Icon f7="trash"></Icon>
                </Button>
            </div>
        </>
    )
}
