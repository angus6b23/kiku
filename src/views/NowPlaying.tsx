import React, { type ReactElement, useCallback } from 'react'
import { Block, Button, Icon, Page } from 'framework7-react'
import { useDispatch, useSelector } from 'react-redux'
import { selectPlayer, stop, togglePlay } from '@/store/playerReducers'
import { selectPlaylist, setItemPlaying } from '@/store/playlistReducers'
import { getNextSong, getPrevSong } from '@/utils/songControl'
import { Store, useCustomContext } from '@/components/context'
import Wavesurfer from '@/components/Wavesurfer'
import NoPlaying from '@/components/NoPlaying'
import { selectConfig } from '@/store/globalConfig'

export default function NowPlaying(): ReactElement {
    const playerState = useSelector(selectPlayer)
    const playlist = useSelector(selectPlaylist)
    const config = useSelector(selectConfig)
    const dispatch = useDispatch()
    const { audio } = useCustomContext(Store)

    const isLastSong: () => boolean = () => {
        const index = playlist.findIndex(
            (item) => item.id === playerState.currentPlaying?.id
        )
        if (index === undefined) {
            return true
        }
        return index === playlist.length - 1
    }
    const isFirstSong: () => boolean = () => {
        const index = playlist.findIndex(
            (item) => item.id === playerState.currentPlaying?.id
        )
        if (index === undefined) {
            return true
        }
        return index === 0
    }
    const handleNextSong = () => {
        const nextSong = getNextSong(playlist)
        if (nextSong === undefined) {
            dispatch(stop())
        } else {
            dispatch(setItemPlaying(nextSong.id))
        }
    }
    const handlePrevSong = () => {
        const prevSong = getPrevSong(playlist)
        if (prevSong === undefined) {
            dispatch(stop())
        } else {
            dispatch(setItemPlaying(prevSong.id))
        }
    }
    const togglePlayFunction = useCallback(() => {
        dispatch(togglePlay())
    }, [dispatch])
    return (
        <Page name="now-playing" className="h-page overflow-auto">
            {playerState.currentPlaying === undefined ? (
                <NoPlaying />
            ) : (
                <Block>
                    <div className="w-full 2xl:h-80 lg:h-64 md:h-48 h-36">
                        <img
                            className="object-contain h-full w-full"
                            src={playerState.currentPlaying.thumbnailURL}
                        />
                    </div>
                    <div className="w-full flex justify-center py-4">
                        <h5 className="text-2xl text-center">
                            {playerState.currentPlaying?.title}
                        </h5>
                    </div>
                    <Wavesurfer
                        media={audio.current}
                        showTimeline={config.ui.showTimeline}
                    />
                    <div className="w-full flex justify-center gap-6">
                        <Button
                            className="h-40 w-40"
                            onClick={() => handlePrevSong()}
                            disabled={isFirstSong()}
                        >
                            <Icon className="text-6xl" f7="backward_end_fill" />
                        </Button>
                        <Button
                            className="h-40 w-40"
                            onClick={() => togglePlayFunction()}
                        >
                            {playerState.status === 'playing' ? (
                                <Icon className="text-6xl" f7="pause_fill" />
                            ) : (
                                <Icon className="text-6xl" f7="play_fill" />
                            )}
                        </Button>
                        <Button
                            className="h-40 w-40"
                            onClick={() => handleNextSong()}
                            disabled={isLastSong()}
                        >
                            <Icon className="text-6xl" f7="forward_end_fill" />
                        </Button>
                    </div>
                </Block>
            )}
        </Page>
    )
}
