import React, {
    type ReactElement,
    useCallback,
    useState,
    useEffect,
    useRef,
} from 'react'
import { Page } from 'framework7-react'
import { useDispatch, useSelector } from 'react-redux'
import { selectPlayer, stop, togglePlay } from '@/store/playerReducers'
import { selectPlaylist, setItemPlaying } from '@/store/playlistReducers'
import { getNextSong, getPrevSong } from '@/utils/songControl'
import { Store, useCustomContext } from '@/store/reactContext'
import NoPlaying from '@/views/NowPlaying-modules/NoPlaying'
import { selectConfig } from '@/store/globalConfig'
import { convertSecond } from '@/utils/format'
import ClassicLayout from '@/views/NowPlaying-modules/ClassicLayout'
import { NowPlayingContext } from '@/store/reactContext'
import LargeBgLayout from '@/views/NowPlaying-modules/LargeBgLayout'

export default function NowPlaying(): ReactElement {
    const playerState = useSelector(selectPlayer)
    const playlist = useSelector(selectPlaylist)
    const config = useSelector(selectConfig)
    const dispatch = useDispatch()
    const { audio } = useCustomContext(Store)

    const seekDuration: number = config.nowPlaying.seekDuration
    const [timestampStyle, setTimestampStyle] = useState('short')
    const [audioTimestamp, setAudioTimestamp] = useState('')
    const nowPlayingRef = useRef<HTMLDivElement>(null) // Used for listening keyboard event
    const isLastSong: () => boolean = () => {
        // Helper function to check if current playing song is the last song
        const index = playlist.findIndex(
            (item) => item.id === playerState.currentPlaying?.id
        )
        if (index === undefined) {
            return true
        }
        return index === playlist.length - 1
    }
    const isFirstSong: () => boolean = () => {
        // Helper function to check if current playing song is the first song
        const index = playlist.findIndex(
            (item) => item.id === playerState.currentPlaying?.id
        )
        if (index === undefined) {
            return true
        }
        return index === 0
    }

    const handleNextSong = () => {
        // Helper function to handle when next song button is clicked
        const nextSong = getNextSong(playlist)
        if (nextSong === undefined) {
            dispatch(stop())
        } else {
            dispatch(setItemPlaying(nextSong.id))
        }
    }
    const handlePrevSong = () => {
        // Helper function to handle when prev song button is clicked
        const prevSong = getPrevSong(playlist)
        if (prevSong === undefined) {
            dispatch(stop())
        } else {
            dispatch(setItemPlaying(prevSong.id))
        }
    }
    const togglePlayFunction = useCallback(() => {
        // Helper function to handle play / pause
        dispatch(togglePlay())
    }, [dispatch])
    const getAudioTime = (currentTime: number) => {
        switch (timestampStyle) {
            case 'short':
                return convertSecond(currentTime)
            case 'long':
                return `${convertSecond(currentTime)} / ${convertSecond(
                    audio.current.duration
                )}`
            case 'remaining':
                return `- ${convertSecond(
                    audio.current.duration - currentTime
                )}`
            default:
                throw new Error('Unknown timestmapStyle')
        }
    }
    const handleSeek = (
        direction: 'forward' | 'backward',
        duration: number
    ) => {
        if (direction === 'forward') {
            const currentTime = audio.current.currentTime
            audio.current.currentTime = Math.min(
                audio.current.duration,
                currentTime + Number(duration)
            )
        } else {
            const currentTime = audio.current.currentTime
            audio.current.currentTime = Math.max(
                0,
                currentTime - Number(duration)
            )
        }
    }
    const handleChangeTimestampStyle = () => {
        switch (timestampStyle) {
            case 'short':
                setTimestampStyle('long')
                break
            case 'long':
                setTimestampStyle('remaining')
                break
            case 'remaining':
                setTimestampStyle('short')
                break
            default:
                setTimestampStyle('short')
        }
    }
    useEffect(() => {
        audio.current.addEventListener('timeupdate', () => {
            setAudioTimestamp(getAudioTime(audio.current.currentTime))
        })
        nowPlayingRef.current?.focus()
        return () =>
            audio.current.removeEventListener('timeupdate', () => {
                setAudioTimestamp(getAudioTime(audio.current.currentTime))
            })
    }, [audio.current, timestampStyle])
    const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
        switch (e.code) {
            case 'ArrowLeft':
                handleSeek('backward', seekDuration)
                break
            case 'ArrowRight':
                handleSeek('forward', seekDuration)
                break
            case 'Space':
                togglePlayFunction()
                break
            default:
        }
    }
    const nowPlayingFunctions = {
        isLastSong: isLastSong,
        isFirstSong: isFirstSong,
        handleChangeTimestampStyle: handleChangeTimestampStyle,
        handleNextSong: handleNextSong,
        handlePrevSong: handlePrevSong,
        handleSeek: handleSeek,
        togglePlayFunction: togglePlayFunction,
        getAudioTime: getAudioTime,
        audioTimestamp: audioTimestamp,
    }
    return (
        <Page name="now-playing" className="h-page overflow-auto">
            {playerState.currentPlaying === undefined ? (
                <NoPlaying />
            ) : (
                <div
                    ref={nowPlayingRef}
                    tabIndex={-1}
                    onKeyDown={handleKeyPress}
                >
                    <NowPlayingContext.Provider value={nowPlayingFunctions}>
                        <LargeBgLayout />
                    </NowPlayingContext.Provider>
                </div>
            )}
        </Page>
    )
}
