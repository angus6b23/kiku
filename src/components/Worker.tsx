import React, {
    type ReactElement,
    useEffect,
    useState,
    useContext,
} from 'react'
import { AudioBlobAction, Playitem } from './interfaces'
import { fetchStreamData, fetchStream } from '../js/fetchInv'
import { useDispatch, useSelector } from 'react-redux'
import {
    selectPlaylist,
    setItemDownloaded,
    setItemDownloading,
    setItemError,
    setItemInfo,
    setItemPlaying,
} from '@/store/playlist'
import { Store } from './context'
import { selectPlayer } from '@/store/player'
export interface WorkerProps {}

export default function Worker(): ReactElement {
    // Spawn a worker which will automatically download bolb in the background
    const playlist = useSelector(selectPlaylist)
    const playerState = useSelector(selectPlayer)
    const dispatch = useDispatch()
    const {
        dispatchAudioBlob,
    }: { dispatchAudioBlob: React.Dispatch<AudioBlobAction> } =
        useContext(Store)

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
        for (let i = playingIndex + 1; i < playlist.length; i++){
            const item = playlist[i];
            if (item.downloadStatus === 'pending'){
                result = item;
                break;
            }
        }
        // Then check items before current playing one
        if ( result === undefined ){
            for (let i = 0; i < playingIndex; i++){
                const item = playlist[i];
                if (item.downloadStatus === 'pending'){
                    result = item;
                    break;
                }
            }
        }
        return result
    }
    const getIsDownloading = () => {
        return playlist.some(item => item.downloadStatus === 'downloading')
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
                if (!nextJob.streamUrl) {
                    console.log(
                        `[Worker] Start download videoInfo: ${nextJob.id} - ${nextJob.title}`
                    )
                    fetchStreamData(nextJob)
                        .then((res) => {
                            if (res !== '') {
                                dispatch(
                                    setItemInfo({
                                        id: nextJob.id,
                                        url: res.url,
                                        type: res.type,
                                    })
                                )
                                // then download the actual blob
                                console.log(
                                    `[Worker] Downloading stream: ${nextJob.id} - ${nextJob.title}`
                                )
                                dispatch(setItemDownloading(nextJob.id))
                                return fetchStream(res.url)
                            }
                        })
                        .then((res: Blob) => {
                            setWorkerState('idle')
                            // console.log('[Worker] Download Finished')
                            dispatchAudioBlob({
                                type: 'ADD_BLOB',
                                payload: { id: nextJob.id, blob: res },
                            })
                            dispatch(setItemDownloaded(nextJob.id))
                        })
                        .catch((err) => {
                            setWorkerState('idle')
                            console.log(err)
                            // Show toast
                            dispatch(setItemError(nextJob.id))
                        })
                } else {
                    // only download blob if the url is already there
                    fetchStream(nextJob.streamUrl)
                        .then(() => {
                            setWorkerState('idle')
                            dispatch(setItemDownloaded(nextJob.id))
                            // console.log('[Worker] Download Finished')
                        })
                        .catch((err) => {
                            setWorkerState('idle')
                            console.log(err)
                            dispatch(setItemError(nextJob.id))
                        })
                }
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
