import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { RootState } from './store'
import { GlobalConfig } from '@/components/interfaces'

const initiConfigState: GlobalConfig = {
    instance: {
        localEnabled: true,
        invidiousEnalbed: true,
        invidiousUrl: 'https://invidious.12a.app',
        pipedEnabled: true,
        pipedUrl: 'https://pipedapi.12a.app',
        preferType: [],
        lang: 'en',
        location: 'US',
    },
    ui: {
        accentColor: '#000000',
        showTimeline: true,
        autoScroll: true
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
    },
})

export const { toggleTimeline } = globalConfig.actions

export default globalConfig.reducer
export const selectConfig = (state: RootState) => state.config
