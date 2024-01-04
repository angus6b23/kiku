import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { RootState } from './store'
import { GlobalConfig, Instance } from '@/typescript/interfaces'

const initConfigState: GlobalConfig = {
    instance: {
        preferType: [
            { type: 'local', url: '', enabled: true },
            {
                type: 'invidious',
                url: 'https://invidious.fdn.fr',
                enabled: true,
            },
            {
                type: 'piped',
                url: 'https://pipedapi.kavin.rocks',
                enabled: true,
            },
        ],
        lang: 'en',
        location: 'US',
    },
    ui: {
        lang: 'en',
        accentColor: '#89a0c2',
        theme: 'dark',
        autoScroll: true,
    },
    nowPlaying: {
        seekDuration: 15,
        showTimeline: false,
    },
    storage: {
        enalbeBlobStorage: true,
        blobStorageSize: 200, // IN MB
    },
}
interface NowPlayingAction {
    key: keyof GlobalConfig['nowPlaying']
    value: unknown
}
export const globalConfig = createSlice({
    name: 'globalConfig',
    initialState: initConfigState,
    reducers: {
        toggleTimeline: (state) => {
            return {
                ...state,
                nowPlaying: {
                    ...state.nowPlaying,
                    showTimeline: !state.nowPlaying.showTimeline,
                },
            }
        },
        toggleBlobStorage: (state) => {
            return {
                ...state,
                storage: {
                    ...state.storage,
                    enalbeBlobStorage: !state.storage.enalbeBlobStorage,
                },
            }
        },
        updateInstance: (state, action: PayloadAction<Instance[]>) => {
            return {
                ...state,
                instance: {
                    ...state.instance,
                    preferType: action.payload,
                },
            }
        },
        updateInstancei18n: (
            state,
            action: PayloadAction<{ type: 'lang' | 'location'; value: string }>
        ) => {
            return {
                ...state,
                instance: {
                    ...state.instance,
                    [action.payload.type]: action.payload.value,
                },
            }
        },
        resetInstance: (state) => {
            return {
                ...state,
                instance: initConfigState.instance,
            }
        },
        changeNowPlaying: (state, action: PayloadAction<NowPlayingAction>) => {
            return {
                ...state,
                nowPlaying: {
                    ...state.nowPlaying,
                    [action.payload.key]: action.payload.value,
                },
            }
        },
        changeLocale: (state, action: PayloadAction<string>) => {
            return {
                ...state,
                ui: {
                    ...state.ui,
                    lang: action.payload,
                },
            }
        },
        changeTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
            return {
                ...state,
                ui: {
                    ...state.ui,
                    theme: action.payload,
                },
            }
        },
        changeAccentColor: (state, action: PayloadAction<string>) => {
            return {
                ...state,
                ui: {
                    ...state.ui,
                    accentColor: action.payload,
                }
            }
        },
        changeStorage: (state, action: PayloadAction<number>) => {
            return {
                ...state,
                storage: {
                    ...state.storage,
                    blobStorageSize: action.payload,
                },
            }
        },
    },
})

export const {
    toggleTimeline,
    toggleBlobStorage,
    updateInstance,
    updateInstancei18n,
    changeLocale,
    changeTheme,
    changeAccentColor,
    changeStorage,
    changeNowPlaying,
} = globalConfig.actions

export default globalConfig.reducer
export const selectConfig = (state: RootState) => state.config
