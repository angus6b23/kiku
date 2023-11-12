import { selectPlayer } from '@/store/player'
import { Button, Icon } from 'framework7-react'
import React, { type ReactElement } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { togglePlay } from '@/store/player'
import { getNextSong } from '@/utils/songControl'
import { selectPlaylist, setItemPlaying } from '@/store/playlist'

export interface ToolbarPlayerProps {
    showNowPlaying: () => void
}

export default function ToolbarPlayer(props: ToolbarPlayerProps): ReactElement {
    const playerState = useSelector(selectPlayer)
    const playlist = useSelector(selectPlaylist)
    const dispatch = useDispatch()

    const handleTogglePlay = () => {
        dispatch(togglePlay())
    }
    const handleNextSong = () => {
        const nextSong = getNextSong(playlist)
        if (nextSong !== undefined) {
            dispatch(setItemPlaying(nextSong.id))
        }
    }
    return (
        <>
            <section className="h-20 w-full flex justify-between items-center px-4">
                {playerState.currentPlaying !== undefined && (
                    <div className="flex flex-start items-center">
                        <img
                            className="h-10 object-contain aspect-video"
                            src={playerState.currentPlaying.thumbnailURL}
                        />
                        <p
                            className="ml-4 cursor-pointer"
                            onClick={props.showNowPlaying}
                        >
                            {playerState.currentPlaying.title}
                        </p>
                    </div>
                )}
                <div className="flex flex-end gap-2 items-center">
                    <Button className="p-2" onClick={handleTogglePlay}>
                        {playerState.status === 'playing' ? (
                            <Icon f7="pause_fill" />
                        ) : (
                            <Icon f7="play_fill" />
                        )}
                    </Button>
                    <Button className="p-2" onClick={handleNextSong}>
                        <Icon f7="forward_end_fill" />
                    </Button>
                </div>
            </section>
        </>
    )
}
