import React, { useEffect, type ReactElement, useRef } from 'react'
import { Store, useCustomContext } from './context'
import { useDispatch, useSelector } from 'react-redux'
import {
    pause,
    play,
    selectPlayer,
    togglePlay,
    setSong,
    stop,
} from '@/store/playerReducers'
import { selectPlaylist, setItemPlaying } from '@/store/playlistReducers'
import { AudioBlobObject } from '@/components/interfaces'
import { getNextSong, getPrevSong } from '@/utils/songControl'

export interface AudioWatcherProps {}

export default function AudioWatcher(): ReactElement {
    const {
        audio,
        audioBlobStore,
    }: {
        audio: React.MutableRefObject<HTMLAudioElement>
        audioBlobStore: AudioBlobObject[]
    } = useCustomContext(Store)
    const playerState = useSelector(selectPlayer)
    const playlist = useSelector(selectPlaylist)
    const dispatch = useDispatch()
    const playerStateRef = useRef(playerState)
    const playlistRef = useRef(playlist)

    const getBlobByID: (id: string | undefined) => Blob = (id) => {
        if (id === undefined) throw new Error('ID is undefined')
        const blobItem = audioBlobStore.find((item) => item.id === id)
        if (blobItem === undefined) throw new Error('Blob ID not found')
        return blobItem.blob as Blob
    }

    // updated playlist state cannot be accessed in the event handler, so use Ref instead
    const dispatchPlayNext = () => {
        const nextSong = getNextSong(playlistRef.current)
        if (nextSong != undefined) {
            dispatch(setItemPlaying(nextSong.id))
        } else {
            dispatch(stop())
        }
    }
    const dispatchPlayPrev = () => {
        const prevSong = getPrevSong(playlistRef.current)
        if (prevSong != undefined) {
            dispatch(setItemPlaying(prevSong.id))
        }
    }

    // Sync playerstate with event listener
    useEffect(() => {
        playerStateRef.current = playerState
    }, [playerState])
    useEffect(() => {
        playlistRef.current = playlist
    }, [playlist])

    // Sync Current playing with playlist
    useEffect(() => {
        if (audio.current == null) {
            throw new Error('Audio Instance not found')
        }
        const playingItem = playlist.find((item) => item.status === 'playing')
        if (
            playingItem != undefined &&
            playingItem?.id != playerState.currentPlaying?.id
        ) {
            dispatch(setSong(playingItem))
            const newAudio = new Audio()
            newAudio.src = URL.createObjectURL(getBlobByID(playingItem.id))
            audio.current = newAudio
            audio.current.play()
            dispatch(play())
            // Create metadata for navigator / os
            const img = new Image()
            img.src = playingItem.thumbnailURL
            const imgWidth = img.width
            const imgHeight = img.height
            navigator.mediaSession.metadata = new MediaMetadata({
                title: playingItem.title,
                artwork: [
                    {
                        src: playingItem.thumbnailURL,
                        sizes: `${imgWidth}x${imgHeight}`,
                        type: 'image/jpg',
                    },
                ],
            })
            navigator.mediaSession.playbackState = 'playing'
        }
    }, [playlist])

    // Sync player status with audio
    useEffect(() => {
        // console.log(playerState.status)
        if (audio.current == null) {
            throw new Error('Audio Instance not found')
        }
        if (playerState.status === 'playing') {
            audio.current.play()
            navigator.mediaSession.playbackState = 'playing'
        } else if (playerState.status === 'paused') {
            audio.current.pause()
            navigator.mediaSession.playbackState = 'paused'
        } else {
            navigator.mediaSession.playbackState = 'none'
        }
    }, [playerState.status])

    // Automatically play next song when current song ends
    useEffect(() => {
        if (audio.current == null) {
            return
        }
        audio.current.addEventListener('ended', dispatchPlayNext)
        return () =>
            audio.current?.removeEventListener('ended', dispatchPlayNext)
    }, [audio.current.src])

    // Add ActionHandler for media session
    useEffect(() => {
        navigator.mediaSession.setActionHandler('play', () => {
            dispatch(play())
        })
        navigator.mediaSession.setActionHandler('pause', () => {
            dispatch(pause())
        })
        navigator.mediaSession.setActionHandler('nexttrack', () => {
            dispatchPlayNext()
        })
        navigator.mediaSession.setActionHandler('previoustrack', () => {
            dispatchPlayPrev()
        })
        navigator.mediaSession.setActionHandler('seekto', (event) => {
            console.log(event)
            if (event.fastSeek != undefined && 'fastSeek' in audio.current) {
                audio.current.fastSeek(event.seekTime as number)
                return
            } else if (event.fastSeek != undefined) {
                audio.current.currentTime = event.seekTime as number
            }
        })
        navigator.mediaSession.setActionHandler('seekforward', () => {
            const currentTime = audio.current.currentTime
            audio.current.currentTime = Math.min(
                audio.current.duration,
                currentTime + 5
            )
        })
        navigator.mediaSession.setActionHandler('seekbackward', () => {
            const currentTime = audio.current.currentTime
            audio.current.currentTime = Math.max(0, currentTime - 5)
        })
        window.onkeydown = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'MediaTrackNext':
                    dispatchPlayNext()
                    break
                case 'MediaTrackPrev':
                    dispatchPlayPrev()
                    break
                case 'MediaPlayPause':
                    dispatch(togglePlay())
                    break
                case 'MediaStop':
                    dispatch(stop())
                    break
                default:
            }
        }
    }, [])
    return <></>
}
