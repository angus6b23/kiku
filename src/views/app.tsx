import React, { useEffect, useReducer, useRef, useState } from 'react'
import {
    AbortControllerObject,
    AudioBlobObject,
    Continuation,
    Instance,
} from '@/components/interfaces'
import { Store } from '@/components/context'

import { f7ready, App, Panel, View, Page, f7 } from 'framework7-react'

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
import { getInvInstances, getPipedInstances } from '@/js/getInstances'
import presentToast from '@/components/Toast'
const initBlobStore: AudioBlobObject[] = []
const MyApp = () => {
    const audio = useRef<HTMLAudioElement>(new Audio())
    const [audioBlobStore, dispatchAudioBlob] = useReducer(
        blobStoreReducer,
        initBlobStore
    )
    const [abortController, setAbortController] =
        useState<AbortControllerObject>({})
    const [instances, setInstances] = useState<Instance[]>([])
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
    useEffect(() => {
        getInvInstances()
            .then((res) => {
                if (res instanceof Error) {
                    throw new Error('unable to fetch invidious instances')
                }
                setInstances((prevState) => {
                    const newInstances = res.map((url: string) => {
                        return {
                            type: 'invidious',
                            url: url,
                            enabled: true,
                        } as Instance
                    })
                    return [...prevState, ...newInstances]
                })
            })
            .catch((err) => {
                presentToast('error', err)
            })
        getPipedInstances()
            .then((res) => {
                if (res instanceof Error) {
                    throw new Error('unable to fetch piped instances')
                }
                setInstances((prevState) => {
                    const newInstances = res.map((url: string) => {
                        return {
                            type: 'piped',
                            url: url,
                            enabled: true,
                        } as Instance
                    })
                    return [...prevState, ...newInstances]
                })
            })
            .catch((err) => {
                presentToast('error', err)
            })
    }, [])

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
                            abortController: abortController,
                            setAbortController: setAbortController,
                            audio: audio,
                            innertube: innertube,
                            instanceList: instances,
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
