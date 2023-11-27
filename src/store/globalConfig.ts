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
        showTimeline: true,
        autoScroll: true,
    },
}

export const globalConfig = createSlice({
    name: 'globalConfig',
    initialState: initConfigState,
    reducers: {
        toggleTimeline: (state) => {
            return {
                ...state,
                ui: { ...state.ui, showTimeline: !state.ui.showTimeline },
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
        changeLocale: (state, action: PayloadAction<string>) => {
            return {
                ...state,
                ui: {
                    ...state.ui,
                    lang: action.payload,
                },
            }
        },
    },
})

export const { toggleTimeline, updateInstance, changeLocale } =
    globalConfig.actions

export default globalConfig.reducer
export const selectConfig = (state: RootState) => state.config
