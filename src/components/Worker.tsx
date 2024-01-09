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
import { getNextSong } from '@/utils/songControl'
import { base64ToBlob, blobToBase64 } from '@/utils/base64'
import {
    deleteBlob,
    saveBlob,
    selectLocalBlobs,
    updateAccess,
} from '@/store/blobStorage'
import {
    savePlaylist,
    selectLocalPlaylist,
} from '@/store/localPlaylistReducers'
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
    // Will be updated when config is changed, used for ipcRenderer to keep the function updated with config
    const configRef = useRef(config)
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

    const [queue, setQueue] = useState<Playitem[]>([])
    const [workerState, setWorkerState] = useState<string>('idle')

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
                    if (configRef.current.storage.enalbeBlobStorage) {
                        // Store to local disk if enabled
                        blobToBase64(blob).then((base64) => {
                            // Send data as base64 to ipcMain
                            ipcRenderer.send('create-blob', {
                                id: nextJob.id,
                                blob: base64,
                                extension: blob.type,
                            })
                            const timeNow = new Date().getTime()
                            // Make a record of the blob for deletion later
                            if (
                                localBlobs.find(
                                    (blob) => blob.id === nextJob.id
                                ) === undefined
                            ) {
                                dispatch(
                                    saveBlob({
                                        id: nextJob.id,
                                        title: nextJob.title,
                                        extension: blob.type,
                                        created: timeNow,
                                        lastAccess: timeNow,
                                    })
                                )
                            }
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
                // Show toast
                dispatch(
                    setItemDownloadStatus({
                        id: nextJob.id,
                        status: 'error',
                    })
                )
            })
    }

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

    const generateQueue = () => {
        // Helper function for generating new queue for worker
        let newQueue: Playitem[] = []
        const currentPlayingIndex = playlist.findIndex(
            (item) => item.status === 'playing'
        )
        if (currentPlayingIndex === -1) {
            newQueue = playlist.filter(
                (item) => item.downloadStatus !== 'downloaded'
            )
        } else {
            for (let i = currentPlayingIndex + 1; i < playlist.length; i++) {
                if (playlist[i].downloadStatus !== 'downloaded') {
                    newQueue.push(playlist[i])
                }
            }
            for (let i = 0; i < currentPlayingIndex; i++) {
                if (playlist[i].downloadStatus !== 'downloaded') {
                    newQueue.push(playlist[i])
                }
            }
        }
        return newQueue
    }

    const queueChanged = (newQueue: Playitem[]) => {
        // Helper function for checking if the queue has changed, only checking the id of every item
        if (newQueue.length !== queue.length) {
            return true
        } else {
            return !newQueue.every((item, index) => item.id === queue[index].id)
        }
    }

    useEffect(() => {
        // Watch for playlist
        const newQueue = generateQueue()
        if (queueChanged(newQueue)) {
            setQueue(newQueue) // Only trigger the worker when there is a change in queue
        }
    }, [playlist])

    useEffect(() => {
        // console.log(workerState)
        // Only work when the status is idle and next job exists
        if (workerState !== 'idle' || queue.length === 0) {
            return
        }
        setWorkerState('working')
        const nextJob = queue[0]
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
        ) // Try to find currently existing local blob first
        if (matchingLocalBlob !== undefined) {
            // If localBlob can be found, try to invoke a request to main process through ipcRenderer
            ipcRenderer
                .invoke('get-blob', nextJob.id)
                .then((res: { exist: boolean; data: undefined | string }) => {
                    // ipcMain will return the data in base64 format
                    if (res.exist && res.data !== undefined) {
                        return base64ToBlob(res.data) // Convert back to blob if retrieved successfully
                    } else {
                        throw new Error('Failed to fetch from local storage')
                    }
                })
                .then((blob: Blob) => {
                    // Add the blob the blob store afterwards
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
                    dispatch(updateAccess(nextJob.id))
                    setWorkerState('idle')
                })
                .catch(() => {
                    fetchStream(nextJob, axiosController)
                })
        } else {
            fetchStream(nextJob, axiosController)
        }
    }, [queue, workerState])

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
            // console.log(sizeInMb)
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
                // console.log('delete-blob', targetBlob)
                ipcRenderer.send('delete-blob', {
                    id: targetBlob.id,
                    extension: targetBlob.extension,
                }) // Send signal to ipcMain
            }
        })
    }, [])

    // Load playlist on startup or changing
    useEffect(() => {
        const currentPlaylist = localPlaylists.playlists.find(
            (playlist) => playlist.id === localPlaylists.currentPlaylistId
        ) as LocalPlaylist
        dispatch(loadPlaylist(currentPlaylist.data))
    }, [localPlaylists.currentPlaylistId])

    // Watch for current playlist, dispatch to save playlist if changed detected
    useEffect(() => {
        let changed = false
        const newPlaylist: Playitem[] = playlist.map((item) => {
            return {
                ...item,
                downloadStatus: 'pending',
                status: 'added',
            }
        })
        const currentPlaylist = localPlaylists.playlists.find(
            (item) => item.id === localPlaylists.currentPlaylistId
        ) as LocalPlaylist
        if (currentPlaylist.data.length != newPlaylist.length) {
            changed = true
        }
        newPlaylist.forEach((item, index) => {
            const playlistItem = currentPlaylist.data[index]
            if (playlistItem === undefined || item.id !== playlistItem.id) {
                changed = true
            }
        })
        if (changed) {
            // console.log('changed')
            dispatch(savePlaylist(newPlaylist))
        }
    }, [playlist])

    useEffect(() => {
        localBlobsRef.current = localBlobs
        configRef.current = config
    }, [localBlobs, config])
    return <></>
}
