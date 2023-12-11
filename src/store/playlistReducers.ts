import { Playitem } from '@/typescript/interfaces'
import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '@/store/store'

const initPlaylist: Playitem[] = []

interface setItemInfoPayload {
    id: string
    url: string
    type: string
}
interface setItemDownloadStatusPayload {
    id: string
    status: 'downloading' | 'downloaded' | 'pending' | 'error'
}
const shuffle: <T>(arg0: T[]) => T[] = (list) => {
    const clone = [...list]
    let currentIndex = clone.length
    while (currentIndex > 0) {
        const randomIndex = Math.floor(Math.random() * currentIndex)
        currentIndex--
        const temp = clone[currentIndex]
        clone[currentIndex] = clone[randomIndex]
        clone[randomIndex] = temp
    }
    return clone
}

export const playlist = createSlice({
    name: 'playlist',
    initialState: initPlaylist,
    reducers: {
        addToPlaylist: (state, action: PayloadAction<Playitem>) => {
            return [...state, action.payload]
        },
        addToNextSong: (state, action: PayloadAction<Playitem>) => {
            const currentPlayingIndex = state.findIndex(
                (item) => item.status === 'playing'
            )
            if (currentPlayingIndex === -1) {
                return [
                    ...state.slice(0, 1),
                    action.payload,
                    ...state.slice(1, state.length),
                ]
            } else {
                return [
                    ...state.slice(0, currentPlayingIndex + 1),
                    action.payload,
                    ...state.slice(currentPlayingIndex + 1, state.length),
                ]
            }
        },
        removeFromPlaylist: (state, action: PayloadAction<string>) => {
            return state.filter((item) => item.id !== action.payload)
        },
        setItemInfo: (state, action: PayloadAction<setItemInfoPayload>) => {
            const { payload } = action
            return state.map((item) => {
                if (item.id === payload.id) {
                    return {
                        ...item,
                        streamUrl: payload.url,
                        audioFormat: payload.type,
                    }
                } else {
                    return item
                }
            })
        },
        setItemDownloadStatus: (
            state,
            action: PayloadAction<setItemDownloadStatusPayload>
        ) => {
            return state.map((item) => {
                return item.id === action.payload.id
                    ? { ...item, downloadStatus: action.payload.status }
                    : item
            })
        },
        setItemPlaying: (state, action: PayloadAction<string>) => {
            return state.map((item) => {
                if (item.id === action.payload) {
                    return {
                        ...item,
                        status: 'playing',
                    }
                } else if (item.status === 'playing') {
                    return {
                        ...item,
                        status: 'played',
                    }
                } else {
                    return item
                }
            })
        },
        setItemRetry: (state, action: PayloadAction<string>) => {
            return state.map((item) =>
                item.id === action.payload
                    ? { ...item, downloadStatus: 'pending' }
                    : item
            )
        },
        clearErrorItems: (state) => {
            return state.filter((item) => item.downloadStatus != 'error')
        },
        clearPlayedItems: (state) => {
            return state.filter((item) => item.status !== 'played')
        },
        clearAllItems: () => {
            return []
        },
        shuffleAll: (state) => {
            const shuffled = shuffle([...state])
            return shuffled
        },
        shuffleUnplayed: (state) => {
            const unchanged = state.filter((item) => item.status !== 'added')
            const shuffled = shuffle(
                state.filter((item) => item.status === 'added')
            )
            return [...unchanged, ...shuffled]
        },
        sort: (state, action: PayloadAction<{ from: number; to: number }>) => {
            const clone = [...state]
            clone.splice(
                action.payload.to,
                0,
                ...clone.splice(action.payload.from, 1)
            )
            return clone
        },
        loadPlaylist: (_, action: PayloadAction<Playitem[]>) => {
            return action.payload
        },
    },
})

export const {
    addToPlaylist,
    addToNextSong,
    removeFromPlaylist,
    setItemInfo,
    setItemDownloadStatus,
    setItemPlaying,
    setItemRetry,
    clearErrorItems,
    clearPlayedItems,
    clearAllItems,
    shuffleAll,
    shuffleUnplayed,
    sort,
    loadPlaylist,
} = playlist.actions

export default playlist.reducer
export const selectPlaylist = (state: RootState) => state.playlist
