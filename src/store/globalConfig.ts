import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { RootState } from './store'
import { GlobalConfig, Instance } from '@/components/interfaces'

const initiConfigState: GlobalConfig = {
    instance: {
        preferType: [
            {
                type: 'piped',
                url: 'https://pipedapi.kavin.rocks',
                enabled: true,
            },
            { type: 'local', url: '', enabled: true },
            {
                type: 'invidious',
                url: 'https://invidious.fdn.fr',
                enabled: true,
            },
        ],
        lang: 'en',
        location: 'US',
    },
    ui: {
        accentColor: '#000000',
        showTimeline: true,
        autoScroll: true,
    },
}

export const globalConfig = createSlice({
    name: 'globalConfig',
    initialState: initiConfigState,
    reducers: {
        toggleTimeline: (state) => {
            return {
                ...state,
                ui: { ...state.ui, showTimeline: !state.ui.showTimeline },
            }
        },
        updateInstance: (state, action:PayloadAction<Instance[]>) => {
            return {
                ...state,
                instance:{
                    ...state.instance,
                    preferType: action.payload
                }
            }
        }
    },
})

export const { toggleTimeline, updateInstance } = globalConfig.actions

export default globalConfig.reducer
export const selectConfig = (state: RootState) => state.config
