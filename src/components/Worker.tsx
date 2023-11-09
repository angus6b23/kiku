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
    const playlist = useSelector(selectPlaylist)
    const playerState = useSelector(selectPlayer)
    const dispatch = useDispatch()
    const {
        dispatchAudioBlob,
    }: { dispatchAudioBlob: React.Dispatch<AudioBlobAction> } =
        useContext(Store)
    const [workerState, setWorkerState] = useState('idle')
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
        playlist.forEach((item, index) => {
            if (
                index < playingIndex &&
                item.downloadStatus == 'pending' &&
                !result
            ) {
                result = item
            } else if (
                index > playingIndex &&
                item.downloadStatus == 'pending' &&
                !result
            ) {
                result = item
            }
        })
        return result
    }
    // Watcher for playlist, automatically download info and audio blob when available
    useEffect(() => {
        if (workerState === 'idle') {
            const nextJob: undefined | Playitem = getNextJob()
            if (nextJob !== undefined) {
                setWorkerState('working')
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
                                console.log(
                                    `[Worker] Downloading stream: ${nextJob.id} - ${nextJob.title}`
                                )
                                dispatch(setItemDownloading(nextJob.id))
                                return fetchStream(res.url, res.type)
                            }
                        })
                        .then((res: Blob) => {
                            setWorkerState('idle')
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
                    fetchStream(nextJob.streamUrl, nextJob.audioFormat)
                        .then(() => {
                            setWorkerState('idle')
                            dispatch(setItemDownloaded(nextJob.id))
                            console.log('[Worker] Download Finished')
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
