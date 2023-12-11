import React, {
    type ReactElement,
    useEffect,
    useState,
    useContext,
    useRef,
} from 'react'
import {
    AudioBlobAction,
    Playitem,
    AbortControllerObject,
} from '@/typescript/interfaces'
import { handleFetchStream } from '@/js/fetchInfo'
import { useDispatch, useSelector } from 'react-redux'
import {
    loadPlaylist,
    selectPlaylist,
    setItemDownloadStatus,
    setItemPlaying,
} from '@/store/playlistReducers'
import { Store } from './context'
import { selectPlayer } from '@/store/playerReducers'
import { selectConfig } from '@/store/globalConfig'
import Innertube from 'youtubei.js/agnostic'
import presentToast from './Toast'
import localforage from 'localforage'
import { getNextSong } from '@/utils/songControl'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const {ipcRenderer} = require('electron')

export interface WorkerProps {}

export default function Worker(): ReactElement {
    // Spawn a worker which will automatically download bolb in the background
    // Get variables from redux store
    const playlist = useSelector(selectPlaylist)
    const playerState = useSelector(selectPlayer)
    const config = useSelector(selectConfig)
    const dispatch = useDispatch()
    const [playlistLoaded, setPlaylistLoaded] = useState(false);
    // Spawn different instance of local forage for corresponding purpose
    const playlistStore = useRef(
        localforage.createInstance({
            name: 'kiku-db',
            storeName: 'current-playlist',
            description: 'Storage for current playlist',
        })
    )
    // Get variables from react context
    const {
        dispatchAudioBlob,
        innertube,
        setAbortController,
    }: {
        dispatchAudioBlob: React.Dispatch<AudioBlobAction>
        innertube: React.RefObject<Innertube | null>
        setAbortController: (
            arg0: (prevState: AbortControllerObject) => AbortControllerObject
        ) => void
    } = useContext(Store)

    // Helper function of adding abort controller to react context
    const handleAddAbortController = (
        id: string,
        controller: AbortController
    ) => {
        setAbortController((prevState: AbortControllerObject) => {
            return { ...prevState, [id]: controller }
        })
    }
    // Will only download one item at once, download when idle, pass when working
    const [workerState, setWorkerState] = useState('idle')

    // Get the next job from playlist
    const getNextJob: () => undefined | Playitem = () => {
        const checkJobs = playlist.some(
            (item) => item.downloadStatus === 'pending'
        )

        let result: undefined | Playitem = undefined
        if (!checkJobs) {
            console.debug('[Worker] No job to work')
            return result
        }
        const playingIndex = playlist.findIndex(
            (item) => item.status === 'playing'
        )

        // Prefer download songs next to currently playing one
        // Check upcoming playing items first
        for (let i = playingIndex + 1; i < playlist.length; i++) {
            const item = playlist[i]
            if (item.downloadStatus === 'pending') {
                result = item
                break
            }
        }
        // Then check items before current playing one
        if (result === undefined) {
            for (let i = 0; i < playingIndex; i++) {
                const item = playlist[i]
                if (item.downloadStatus === 'pending') {
                    result = item
                    break
                }
            }
        }
        return result
    }
    // const getIsDownloading = () => {
    //     return playlist.some((item) => item.downloadStatus === 'downloading')
    // }

    // Watcher for playlist, automatically download info and audio blob when available
    useEffect(() => {
        // console.log('worker triggered', workerState)
        // Sometimes worker state do not come up when large item is downloading
        if (workerState === 'idle') {
            const nextJob: undefined | Playitem = getNextJob()
            if (nextJob !== undefined) {
                // Only work when the status is idle and next job exists
                setWorkerState('working')
                // try to fetch stream url first from info
                // if (!nextJob.streamUrl) {
                console.log(
                    `[Worker] Start download video: ${nextJob.id} - ${nextJob.title}`
                )
                // Create an abort controller for axios
                const axiosController = new AbortController()
                // Add the abort controller to react context
                handleAddAbortController(nextJob.id, axiosController)
                // Tell redux that the current job is downloading
                dispatch(
                    setItemDownloadStatus({
                        id: nextJob.id,
                        status: 'downloading',
                    })
                )
                // Pass parameters to fetch stream, including an abort controller to stop downloading if the item is removed
                handleFetchStream(
                    nextJob.id,
                    config.instance.preferType,
                    innertube?.current,
                    axiosController
                )
                    .then((blob) => {
                        // Check if the result is an error
                        if (blob instanceof Error) {
                            throw new Error(blob as unknown as string)
                        } else {
                            // Dispatch the audio blob to react context
                            dispatchAudioBlob({
                                type: 'ADD_BLOB',
                                payload: { id: nextJob.id, blob: blob },
                            })
                            setWorkerState('idle')
                            dispatch(
                                setItemDownloadStatus({
                                    id: nextJob.id,
                                    status: 'downloaded',
                                })
                            )
                        }
                    })
                    .catch((err) => {
                        setWorkerState('idle')
                        console.log(err)
                        presentToast('error', err)
                        // Show toast
                        dispatch(
                            setItemDownloadStatus({
                                id: nextJob.id,
                                status: 'error',
                            })
                        )
                    })
            }
        }
    }, [playlist])

    // Watch for playlist, automatically play music when new song is added
    useEffect(() => {
        if (playerState.status === 'stopped') {
            if (
                playlist[0] !== undefined &&
                playlist[0].downloadStatus === 'downloaded'
            ) {
                setTimeout(() => {
                    // Use settimeout to prevent the audio blob dispatch not yet ready
                    if (playerState.currentPlaying === undefined) {
                        dispatch(setItemPlaying(playlist[0].id))
                    } else {
                        const nextSong = getNextSong(playlist)
                        nextSong !== undefined &&
                            dispatch(setItemPlaying(nextSong.id))
                    }
                }, 200)
            }
        }
    }, [playlist])

    // Automatically store playlist
    useEffect(() => {
        if (playlistLoaded) {
            const playlistClone = playlist.map((item) => {
                return {
                    ...item,
                    downloadStatus: 'pending',
                    status: 'added',
                }
            })
            playlistStore.current.setItem('current-playlist', playlistClone)
        }
    }, [playlist, playlistLoaded])

    // Automatically load playlist after innertube is loaded
    useEffect(() => {
        setTimeout(() => {
            playlistStore.current.getItem('current-playlist').then((res) => {
                setPlaylistLoaded(true)
                const loadedRes = res as Playitem[] | null
                if (loadedRes !== null) {
                    dispatch(loadPlaylist(loadedRes))
                }
            })
        }, 200)
    }, [])
    return <></>
}
