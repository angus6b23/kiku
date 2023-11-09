import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { RootState } from './store'
import { GlobalConfig } from '@/components/interfaces'

const initiConfigState: GlobalConfig = {
    preferType: 'local',
    invInstance: '',
    pipedInstance: '',
}

export const globalConfig = createSlice({
    name: 'globalConfig',
    initialState: initiConfigState,
    reducers: {},
})

// export const {} = globalConfig.actions;

export default globalConfig.reducer
export const selectConfig = (state: RootState) => state.config
