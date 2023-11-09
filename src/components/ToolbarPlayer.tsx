import { selectPlayer } from '@/store/player'
import { Icon } from 'framework7-react'
import React, { type ReactElement } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { togglePlay } from '@/store/player'

export interface ToolbarPlayerProps {
    showNowPlaying: () => void
}

export default function ToolbarPlayer(props: ToolbarPlayerProps): ReactElement {
    const playerState = useSelector(selectPlayer)
    const dispatch = useDispatch()

    const handleTogglePlay = () => {
        dispatch(togglePlay())
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
                    <button className="p-2" onClick={handleTogglePlay}>
                        {playerState.status === 'playing' ? (
                            <Icon f7="pause_fill" />
                        ) : (
                            <Icon f7="play_fill" />
                        )}
                    </button>
                    <button className="p-2">
                        <Icon f7="forward_end_fill" />
                    </button>
                </div>
            </section>
        </>
    )
}
