import React, { type ReactElement } from 'react'
import { Button, Icon } from 'framework7-react'
import { useDispatch } from 'react-redux'
import { clearErrorItems, clearPlayedItems, shuffleUnplayed } from '@/store/playlist'

export interface PlaylistControlBarProps {}

export default function PlaylistControlBar(): ReactElement {
    const dispatch = useDispatch()
    return (
        <>
            <div className="flex flex-wrap h-full items-center gap-2 px-2 py-2 ">
                <Button
                    tooltip="Clear Error videos"
                    onClick={() => dispatch(clearErrorItems())}
                >
                    <Icon f7="flag_slash_fill"></Icon>
                </Button>
                <Button
                    className="p-2"
                    tooltip="Clear played videos"
                    onClick={() => dispatch(clearPlayedItems())}
                >
                    <Icon f7="flowchart_fill"></Icon>
                </Button>
                <Button
                    className="p-2"
                    tooltip="Shuffle unplayed items"
                    onClick={() => dispatch(shuffleUnplayed())}
                >
                    <Icon f7="shuffle"></Icon>
                </Button>
            </div>
        </>
    )
}
