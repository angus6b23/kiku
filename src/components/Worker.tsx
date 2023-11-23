import React, {
    type ReactElement,
    useEffect,
    useState,
    useContext,
} from 'react'
import { AudioBlobAction, Playitem } from './interfaces'
import { handleFetchStream } from '@/js/fetchInfo'
import { useDispatch, useSelector } from 'react-redux'
import {
    selectPlaylist,
    setItemDownloadStatus,
    setItemPlaying,
} from '@/store/playlistReducers'
import { Store } from './context'
import { selectPlayer } from '@/store/playerReducers'
import { selectConfig } from '@/store/globalConfig'
import Innertube from 'youtubei.js/agnostic'
import presentToast from './Toast'
export interface WorkerProps {}

export default function Worker(): ReactElement {
    // Spawn a worker which will automatically download bolb in the background
    const playlist = useSelector(selectPlaylist)
    const playerState = useSelector(selectPlayer)
    const config = useSelector(selectConfig)
    const dispatch = useDispatch()
    const {
        dispatchAudioBlob,
        innertube,
    }: {
        dispatchAudioBlob: React.Dispatch<AudioBlobAction>
        innertube: React.RefObject<Innertube | null>
    } = useContext(Store)

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
    const getIsDownloading = () => {
        return playlist.some((item) => item.downloadStatus === 'downloading')
    }

    // Watcher for playlist, automatically download info and audio blob when available
    useEffect(() => {
        // console.log('worker triggered', workerState)
        // Sometimes worker state do not come up when large item is downloading
        if (workerState === 'idle' || !getIsDownloading()) {
            const nextJob: undefined | Playitem = getNextJob()
            if (nextJob !== undefined) {
                // Only work when the status is idle and next job exists
                setWorkerState('working')
                // try to fetch stream url first from info
                // if (!nextJob.streamUrl) {
                console.log(
                    `[Worker] Start download video: ${nextJob.id} - ${nextJob.title}`
                )
                dispatch(setItemDownloadStatus({id: nextJob.id, status: 'downloading'}))
                handleFetchStream(
                    nextJob.id,
                    config.instance.preferType,
                    innertube?.current
                )
                    .then((blob) => {
                        if (blob instanceof Error) {
                            throw new Error(blob as unknown as string)
                        } else {
                            dispatchAudioBlob({
                                type: 'ADD_BLOB',
                                payload: { id: nextJob.id, blob: blob },
                            })
                            dispatch(setItemDownloadStatus({id: nextJob.id, status: 'downloaded'}))
                        }
                    })
                    // .then((res: Blob) => {
                    //     setWorkerState('idle')
                    //     // console.log('[Worker] Download Finished')
                    //     dispatchAudioBlob({
                    //         type: 'ADD_BLOB',
                    //         payload: { id: nextJob.id, blob: res },
                    //     })
                    //     dispatch(setItemDownloaded(nextJob.id))
                    // })
                    .catch((err) => {
                        setWorkerState('idle')
                        console.log(err)
                        presentToast('error', err)
                        // Show toast
                        dispatch(setItemDownloadStatus({id: nextJob.id, status: 'error'}))
                    })
                // } else {
                //     // only download blob if the url is already there
                //     fetchStream(nextJob.streamUrl)
                //         .then(() => {
                //             setWorkerState('idle')
                //             dispatch(setItemDownloaded(nextJob.id))
                //             // console.log('[Worker] Download Finished')
                //         })
                //         .catch((err) => {
                //             setWorkerState('idle')
                //             console.log(err)
                //             dispatch(setItemError(nextJob.id))
                //         })
                // }
            }
        }
    }, [playlist])
    // Watch for playlist, automatically play music when new song is added
    useEffect(() => {
        if (playerState.status === 'stopped') {
            const currentPlayingIndex = playlist.findIndex(
                (item) => item.status === 'playing'
            )
            for (let i = currentPlayingIndex + 1; i < playlist.length; i++) {
                const nextSong = playlist[i]
                if (nextSong.downloadStatus === 'downloaded') {
                    setTimeout(() => {
                        console.log(
                            `[Audo Play] Auto playing ${nextSong.title}`
                        )
                        dispatch(setItemPlaying(nextSong.id))
                    }, 250)
                    break
                }
            }
        }
    }, [playlist])
    return <></>
}
