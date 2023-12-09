import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { RootState } from './store'
import { GlobalConfig, Instance } from '@/components/interfaces'

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
        accentColor: '#000000',
        theme: 'dark',
        autoScroll: true,
    },
    nowPlaying: {
        seekDuration: 15,
        showTimeline: false,
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
        updateInstance: (state, action: PayloadAction<Instance[]>) => {
            return {
                ...state,
                instance: {
                    ...state.instance,
                    preferType: action.payload,
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
    },
})

export const {
    toggleTimeline,
    updateInstance,
    changeLocale,
    changeTheme,
    changeNowPlaying,
} = globalConfig.actions

export default globalConfig.reducer
export const selectConfig = (state: RootState) => state.config
