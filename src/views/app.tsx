import React, { useReducer, useRef, useState } from 'react'
import { AudioBlobObject, Continuation } from '@/components/interfaces'
import { Store } from '@/components/context'

import {
    f7ready,
    App,
    Panel,
    View,
    Page,
} from 'framework7-react'

import PlayList from '@/views/PlayList'
import { blobStoreReducer } from '@/components/reducers'
import { Provider } from 'react-redux'
import Worker from '@/components/Worker'
import AudioWatcher from '@/components/AudioWatcher'
import { store, persistor } from '@/store/store'
import routes from '@/js/routes'
import Innertube from 'youtubei.js/agnostic'
import InnerTube from '@/components/InnerTube'
import { PersistGate } from 'redux-persist/integration/react'
import HomePage from '@/views/HomePage'

const initBlobStore: AudioBlobObject[] = []
const MyApp = () => {
    const audio = useRef<HTMLAudioElement>(new Audio())
    const [audioBlobStore, dispatchAudioBlob] = useReducer(
        blobStoreReducer,
        initBlobStore
    )
    const innertube = useRef<Innertube>(null)
    const [continuation, setContinuation] = useState<Continuation>(undefined)
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
            <Provider store={store}>
                <PersistGate loading={null} persistor={persistor}>
                    <Store.Provider
                        value={{
                            continuation: continuation,
                            setContinuation: setContinuation,
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
                                    <PlayList />
                                </Page>
                            </View>
                        </Panel>

                        <View main router={false}>
                            <HomePage />
                        </View>
                    </Store.Provider>
                </PersistGate>
            </Provider>
        </App>
    )
}
export default MyApp
