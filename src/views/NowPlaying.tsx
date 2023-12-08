import React, { type ReactElement, useCallback, useState, useEffect } from 'react'
import { Block, Button, Icon, Page } from 'framework7-react'
import { useDispatch, useSelector } from 'react-redux'
import { selectPlayer, stop, togglePlay } from '@/store/playerReducers'
import { selectPlaylist, setItemPlaying } from '@/store/playlistReducers'
import { getNextSong, getPrevSong } from '@/utils/songControl'
import { Store, useCustomContext } from '@/components/context'
import Wavesurfer from '@/components/Wavesurfer'
import NoPlaying from '@/components/NoPlaying'
import { selectConfig } from '@/store/globalConfig'
import {convertSecond} from '@/utils/format'

export default function NowPlaying(): ReactElement {
    const playerState = useSelector(selectPlayer)
    const playlist = useSelector(selectPlaylist)
    const config = useSelector(selectConfig)
    const dispatch = useDispatch()
    const { audio } = useCustomContext(Store)

    const [timestampStyle, setTimestampStyle] = useState('short')
    const [audioTimestamp, setAudioTimestamp] = useState('')
    const isLastSong: () => boolean = () => { // Helper function to check if current playing song is the last song
        const index = playlist.findIndex(
            (item) => item.id === playerState.currentPlaying?.id
        )
        if (index === undefined) {
            return true
        }
        return index === playlist.length - 1
    }
    const isFirstSong: () => boolean = () => { // Helper function to check if current playing song is the first song
        const index = playlist.findIndex(
            (item) => item.id === playerState.currentPlaying?.id
        )
        if (index === undefined) {
            return true
        }
        return index === 0
    }

    const handleNextSong = () => { // Helper function to handle when next song button is clicked
        const nextSong = getNextSong(playlist)
        if (nextSong === undefined) {
            dispatch(stop())
        } else {
            dispatch(setItemPlaying(nextSong.id))
        }
    }
    const handlePrevSong = () => { // Helper function to handle when prev song button is clicked
        const prevSong = getPrevSong(playlist)
        if (prevSong === undefined) {
            dispatch(stop())
        } else {
            dispatch(setItemPlaying(prevSong.id))
        }
    }
    const togglePlayFunction = useCallback(() => { // Helper function to handle play / pause
        dispatch(togglePlay())
    }, [dispatch])
    const getAudioTime = (currentTime: number) => {
        switch(timestampStyle){
            case 'short':
                return convertSecond(currentTime);
            case 'long':
                return `${convertSecond(currentTime)} / ${convertSecond(audio.current.duration)}`
            case 'remaining':
                return `- ${convertSecond(audio.current.duration - currentTime)}`
            default:
                throw new Error('Unknown timestmapStyle')
        }
    }
    const handleChangeTimestampStyle = () => {
        switch(timestampStyle){
            case 'short':
                setTimestampStyle('long')
            break;
            case 'long':
                setTimestampStyle('remaining');
            break;
            case 'remaining':
                setTimestampStyle('short');
            break;
            default:
                setTimestampStyle('short');
        }
    }
    useEffect(() => {
        audio.current.addEventListener('timeupdate', () => {
            setAudioTimestamp(getAudioTime(audio.current.currentTime)) 
        })
        return () => audio.current.removeEventListener('timeupdate', () => {
            setAudioTimestamp(getAudioTime(audio.current.currentTime))
        })
    }, [audio.current, timestampStyle])
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
                    <a className="text-lg flex mt-4 items-center justify-center cursor-pointer" onClick={handleChangeTimestampStyle}>
                        <p>{audioTimestamp}</p>
                    </a>
                    <div className="w-full flex justify-center gap-6">
                        <Button
                            className="h-32 w-32"
                            onClick={() => handlePrevSong()}
                            disabled={isFirstSong()}
                        >
                            <Icon className="text-6xl" f7="backward_end_fill" />
                        </Button>
                        <Button
                            className="h-32 w-32"
                            onClick={() => togglePlayFunction()}
                        >
                            {playerState.status === 'playing' ? (
                                <Icon className="text-6xl" f7="pause_fill" />
                            ) : (
                                <Icon className="text-6xl" f7="play_fill" />
                            )}
                        </Button>
                        <Button
                            className="h-32 w-32"
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
