import React, { useEffect, useReducer, useRef, useState } from 'react'
import { PlayerState, Playitem, PlaylistAction } from './interfaces'
import { Store } from './context'

import {
    f7,
    f7ready,
    App,
    Panel,
    View,
    Views,
    Page,
    Navbar,
    Toolbar,
    Link,
    BlockTitle,
    List,
    ListItem,
} from 'framework7-react'

import routes from '../js/routes'
import PlayList from '../views/PlayList'
import { playlistReducer, playerReducer } from './reducers'
import { fetchStream, fetchStreamData } from '../js/fetchInv';

const initPlaylist: Playitem[] = [];
const initPlayerState: PlayerState = {
    currentPlaying: undefined,
    playing: false
}
const MyApp = () => {
    const audio = useRef(null);
    const audioSource = useRef(null);

    const [workerState, setWorkerState] = useState('idle')
    const [playlist, dispatchPlaylist] = useReducer(
        playlistReducer,
        initPlaylist
    )
    const [playerState, dispatchPlayer] = useReducer(
        playerReducer,
        initPlayerState
    )
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
    useEffect(() => {
        console.log(workerState)
        if (workerState === 'idle') {
            const nextJob: undefined | Playitem = getNextJob()
            if (nextJob != undefined) {
                setWorkerState('working')
                if (!nextJob.streamUrl) {
                    console.log(
                        `[Worker] Start download videoInfo: ${nextJob.id} - ${nextJob.title}`
                    )
                    fetchStreamData(nextJob)
                        .then((res) => {
                            if (res !== ''){
                                console.log(res)
                                dispatchPlaylist({
                                    type: 'SET_STREAM',
                                    payload: { id: nextJob.id, url: res.url, type: res.type },
                                })
                                console.log(
                                    `[Worker] Downloading stream: ${nextJob.id} - ${nextJob.title}`
                                )
                                dispatchPlaylist({
                                    type: 'SET_DOWNLOADING',
                                    payload: nextJob.id,
                                })
                                return fetchStream(res.url, res.type)
                            }
                        })
                        .then((res) => {
                            setWorkerState('idle')
                            dispatchPlaylist({
                                type: 'SET_BLOB',
                                payload: { id: nextJob.id, res: res },
                            })
                        })
                } else {
                    fetchStream(nextJob.streamUrl, nextJob.audioFormat).then((res) => {
                        setWorkerState('idle')
                        dispatchPlaylist({
                            type: 'SET_BLOB',
                            payload: { id: nextJob.id, res: res },
                        })
                    })
                }
            }
        }
    }, [playlist])
    // Framework7 Parameters
    const f7params = {
        name: 'Kiku', // App name
        theme: 'auto', // Automatic theme detection
        colors: {
            primary: '#89a0c2',
        },
        darkMode: true,

        routes: routes,
    }
    f7ready(() => {
        // Call F7 APIs here
    })

    return (
        <App {...f7params}>
            <audio ref={audio}>
                <source ref={audioSource} />
            </audio>
            <Store.Provider
                value={{
                    playlist: playlist,
                    dispatchPlaylist: dispatchPlaylist,
                    playerState: playerState,
                    dispatchPlayer: dispatchPlayer,
                    audio: audio,
                    audioSource: audioSource
                }}
            >
                <Panel
                    className="min-w-60 w-1/3 lg:w-1/4"
                    right
                    visibleBreakpoint={640}
                >
                    <View>
                        <Page>
                            <Navbar title="PlayList" />
                            <PlayList />
                        </Page>
                    </View>
                </Panel>

                {/* Your main view, should have "view-main" class */}
                <View main className="safe-areas" url="/" />

                <Toolbar bottom></Toolbar>
            </Store.Provider>
        </App>
    )
}
export default MyApp
