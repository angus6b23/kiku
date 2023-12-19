import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { RootState } from './store'
import { LocalBlobEntry } from '@/typescript/interfaces'

const initLocalBlobs: LocalBlobEntry[] = []

export const localBlobs = createSlice({
    name: 'blob-store',
    initialState: initLocalBlobs,
    reducers: {
        saveBlob: (state, action: PayloadAction<LocalBlobEntry>) => {
            return [...state, action.payload]
        },
        deleteBlob: (state, action: PayloadAction<string>) => {
            return state.filter((item) => item.id !== action.payload)
        },
        updateAccess: (state, action: PayloadAction<string>) => {
            const timeNow = new Date().getTime()
            return state.map((item) =>
                item.id === action.payload
                    ? { ...item, lastAccess: timeNow }
                    : item
            )
        },
    },
})

export const { saveBlob, deleteBlob, updateAccess } = localBlobs.actions

export default localBlobs.reducer
export const selectLocalBlobs = (state: RootState) => state.localBlobs
