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
    LocalBlobEntry,
    LocalPlaylist,
} from '@/typescript/interfaces'
import { handleFetchStream } from '@/js/fetchInfo'
import { useDispatch, useSelector } from 'react-redux'
import {
    loadPlaylist,
    selectPlaylist,
    setItemDownloadStatus,
    setItemPlaying,
} from '@/store/playlistReducers'
import { Store } from '@/store/reactContext'
import { selectPlayer } from '@/store/playerReducers'
import { selectConfig } from '@/store/globalConfig'
import Innertube from 'youtubei.js/agnostic'
import presentToast from './Toast'
import { getNextSong } from '@/utils/songControl'
import { base64ToBlob, blobToBase64 } from '@/utils/base64'
import { deleteBlob, saveBlob, selectLocalBlobs } from '@/store/blobStorage'
import {savePlaylist, selectLocalPlaylist} from '@/store/localPlaylistReducers'
import {Playlist} from 'youtubei.js/dist/src/parser/nodes'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { ipcRenderer } = require('electron')

export interface WorkerProps {}

export default function Worker(): ReactElement {
    // Spawn a worker which will automatically download bolb in the background
    // Get variables from redux store
    const playlist = useSelector(selectPlaylist)
    const playerState = useSelector(selectPlayer)
    const config = useSelector(selectConfig)
    const localBlobs = useSelector(selectLocalBlobs)
    const localPlaylists = useSelector(selectLocalPlaylist)
    const dispatch = useDispatch()
    // Spawn different instance of local forage for corresponding purpose
    const localBlobsRef = useRef(localBlobs)
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
    // Helper function for fetching stream via different api
    const fetchStream = (
        nextJob: Playitem,
        axiosController: AbortController
    ) => {
        handleFetchStream(
            nextJob.id,
            config.instance.preferType,
            innertube?.current,
            axiosController
        )
            // Pass parameters to fetch stream, including an abort controller to stop downloading if the item is removed
            .then((blob: Blob | Error) => {
                // Check if the result is an error
                if (blob instanceof Error) {
                    throw new Error(blob as unknown as string)
                } else {
                    // Dispatch the audio blob to react context
                    dispatchAudioBlob({
                        type: 'ADD_BLOB',
                        payload: { id: nextJob.id, blob: blob },
                    })
                    if (config.storage.enalbeBlobStorage) {
                        // Store to local disk if enabled
                        blobToBase64(blob).then((base64) => {
                            ipcRenderer.send('create-blob', {
                                id: nextJob.id,
                                blob: base64,
                                extension: blob.type,
                            })
                            const timeNow = new Date().getTime()
                            dispatch(
                                saveBlob({
                                    id: nextJob.id,
                                    title: nextJob.title,
                                    extension: blob.type,
                                    created: timeNow,
                                    lastAccess: timeNow,
                                })
                            )
                        })
                    }
                    setWorkerState('idle')
                    dispatch(
                        setItemDownloadStatus({
                            id: nextJob.id,
                            status: 'downloaded',
                        })
                    )
                }
            })
            .catch((err: Error) => {
                setWorkerState('idle')
                console.log(err)
                presentToast('error', err.message)
                // Show toast
                dispatch(
                    setItemDownloadStatus({
                        id: nextJob.id,
                        status: 'error',
                    })
                )
            })
    }

    // Will only download one item at once, download when idle, pass when working
    const [workerState, setWorkerState] = useState('idle')

    // Get the next job from playlist
    const getNextJob: () => undefined | Playitem = () => {
        const jobsAvailable = playlist.some(
            (item) => item.downloadStatus === 'pending'
        )

        let result: undefined | Playitem = undefined
        if (!jobsAvailable) {
            // Simply quit when there is no jobs
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
        // Wait for innertube to be ready
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
                const matchingLocalBlob = localBlobs.find(
                    (item) => item.id === nextJob.id
                ) // Try to find currently existing local blob
                if (matchingLocalBlob !== undefined) {
                    // If localBlob can be found, try to invoke a request to main process through ipcRenderer
                    ipcRenderer
                        .invoke('get-blob', nextJob.id)
                        .then(
                            (res: {
                                exist: boolean
                                data: undefined | string
                            }) => {
                                // ipcMain will return exist: boolean, data: string(base64)
                                if (res.exist && res.data !== undefined) {
                                    base64ToBlob(res.data)
                                        .then((blob) => {
                                            dispatchAudioBlob({
                                                type: 'ADD_BLOB',
                                                payload: {
                                                    id: nextJob.id,
                                                    blob: blob,
                                                },
                                            })
                                            dispatch(
                                                setItemDownloadStatus({
                                                    id: nextJob.id,
                                                    status: 'downloaded',
                                                })
                                            )
                                            setWorkerState('idle')
                                        })
                                        .catch((err) => {
                                            // Fetch Stream if any error occurs
                                            console.error(err)
                                            fetchStream(
                                                nextJob,
                                                axiosController
                                            )
                                        })
                                } else {
                                    // Fetch Stream if the id do not exist in local storage
                                    fetchStream(nextJob, axiosController)
                                }
                            }
                        )
                } else {
                    // Simply fetch from internet if local blob is not found
                    fetchStream(nextJob, axiosController)
                }
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

    useEffect(() => {
        ipcRenderer.on('dir-size', (_: Event, size: number) => {
            // ipcMain will report the disk usage after each creation and deletion
            const sizeInMb = Math.round(size / 1024 / 1024)
            console.log(sizeInMb)
            if (sizeInMb > config.storage.blobStorageSize) {
                // Send delete signal to ipcMain if the current disk usage is larger than configed
                const targetBlob = localBlobsRef.current.reduce(
                    (acc, cur) => {
                        // Find the blob with the furthest last Access
                        return acc.lastAccess > cur.lastAccess ? cur : acc
                    },
                    {
                        lastAccess: Infinity,
                        id: '',
                        extension: '',
                    } as LocalBlobEntry
                )
                dispatch(deleteBlob(targetBlob.id)) // Remove item from local blob entry
                ipcRenderer.send('delete-blob', {
                    id: targetBlob.id,
                    extension: targetBlob.extension,
                }) // Send signal to ipcMain
            }
        })
    }, [])

    // Load playlist on startup or changing
    useEffect(() => {
        console.log('triggered load playlist')
        const currentPlaylist = localPlaylists.playlists.find(playlist => playlist.id === localPlaylists.currentPlaylistId) as LocalPlaylist
        dispatch(loadPlaylist(currentPlaylist.data))
    }, [localPlaylists.currentPlaylistId])

    useEffect(() => {
        let changed = false
        const newPlaylist: Playitem[] = playlist.map(item => {
            return {
                ...item,
                downloadStatus: 'pending',
                status: 'added'
            }
        })
        const currentPlaylist = localPlaylists.playlists.find(item => item.id === localPlaylists.currentPlaylistId) as LocalPlaylist
        newPlaylist.forEach((item, index) => {
            const playlistItem = currentPlaylist.data[index];
           if (playlistItem === undefined || item.id !== playlistItem.id){
               changed = true
           }
        })
        if (changed){
            console.log('change detected')
            dispatch(savePlaylist(newPlaylist))
        }
    }, [playlist])

    useEffect(() => {
        localBlobsRef.current = localBlobs
    }, [localBlobs, playlist])
    return <></>
}
