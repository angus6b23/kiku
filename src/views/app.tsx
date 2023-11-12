import React, { useReducer, useRef } from 'react'
import {
    AudioBlobObject,
} from '@/components/interfaces'
import { Store } from '@/components/context'

import {
    f7,
    f7ready,
    App,
    Panel,
    View,
    Page,
    Navbar,
    Toolbar,
} from 'framework7-react'

import PlayList from '@/views/PlayList'
import { blobStoreReducer } from '@/components/reducers'
import { Provider } from 'react-redux'
import Worker from '@/components/Worker'
import AudioWatcher from '@/components/AudioWatcher'
import store from '@/store/store'
import HomePage from '@/views/HomePage'
import Innertube from 'youtubei.js/agnostic'
import InnerTube from '@/components/InnerTube'

const initBlobStore: AudioBlobObject[] = []
const MyApp = () => {
    const audio = useRef<HTMLAudioElement>(new Audio())
    const [audioBlobStore, dispatchAudioBlob] = useReducer(
        blobStoreReducer,
        initBlobStore
    )
    const innertube = useRef<Innertube>(null)
    // Framework7 Parameters
    const f7params = {
        name: 'Kiku', // App name
        theme: 'auto', // Automatic theme detection
        colors: {
            primary: '#89a0c2',
        },
        darkMode: true,
    }
    f7ready(() => {
        // Call F7 APIs here
    })

    return (
        <App {...f7params}>
            <Provider store={store}>
                <Store.Provider
                    value={{
                        // playlist: playlist,
                        // dispatchPlaylist: dispatchPlaylist,
                        // playerState: playerState,
                        // dispatchPlayer: dispatchPlayer,
                        audioBlobStore: audioBlobStore,
                        dispatchAudioBlob: dispatchAudioBlob,
                        audio: audio,
                        innertube: innertube,
                    }}
                >
                    <Worker />
                    <InnerTube />
                    <AudioWatcher />
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
                    <View main>
                        <HomePage />
                    </View>

                    <Toolbar bottom></Toolbar>
                </Store.Provider>
            </Provider>
        </App>
    )
}
export default MyApp
