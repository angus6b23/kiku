import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { RootState } from './store'
import { LocalPlaylist, Playitem } from '@/typescript/interfaces'
import { nanoid } from 'nanoid'

const initLocalPlaylist: {
    currentPlaylistId: string
    playlists: LocalPlaylist[]
} = {
    currentPlaylistId: 'default',
    playlists: [
        {
            name: 'default',
            id: 'default',
            data: [],
        },
    ],
}

export const newLocalPlaylist = createAsyncThunk(
    'localPlaylist/newLocalPlaylist',
    (name: string, { dispatch, getState }) => {
        dispatch(localPlaylists.actions.newPlaylist(name))
        const newPlaylist = getState()['localPlaylists']['playlists'].findLast(
            (playlist: LocalPlaylist) => playlist.name === name
        )
        return newPlaylist.id
    }
)

export const localPlaylists = createSlice({
    name: 'local-playlists',
    initialState: initLocalPlaylist,
    reducers: {
        newPlaylist: (state, action: PayloadAction<string>) => {
            return {
                ...state,
                playlists: [
                    ...state.playlists,
                    { name: action.payload, id: nanoid(5), data: [] },
                ],
            }
        },
        removePlaylist: (state, action: PayloadAction<string>) => {
            return {
                ...state,
                playlists: state.playlists.filter(
                    (playlist) => playlist.id !== action.payload
                ),
            }
        },
        renamePlaylist: (
            state,
            action: PayloadAction<{ id: string; newName: string }>
        ) => {
            return {
                ...state,
                playlists: state.playlists.map((playlist) =>
                    playlist.id === action.payload.id
                        ? { ...playlist, name: action.payload.newName }
                        : playlist
                ),
            }
        },
        savePlaylist: (state, action: PayloadAction<Playitem[]>) => {
            return {
                ...state,
                playlists: state.playlists.map((playlist) =>
                    playlist.id === state.currentPlaylistId
                        ? { ...playlist, data: action.payload }
                        : playlist
                ),
            }
        },
        setPlaylistItem: (
            state,
            action: PayloadAction<{ id: string; items: Playitem[] }>
        ) => {
            return {
                ...state,
                playlists: state.playlists.map((playlist) =>
                    playlist.id === action.payload.id
                        ? {
                              ...playlist,
                              data: action.payload.items,
                          }
                        : playlist
                ),
            }
        },
        changeCurrentPlaylist: (state, action: PayloadAction<string>) => {
            return {
                ...state,
                currentPlaylistId: action.payload,
            }
        },
    },
})

export const {
    newPlaylist,
    removePlaylist,
    renamePlaylist,
    savePlaylist,
    changeCurrentPlaylist,
    setPlaylistItem,
} = localPlaylists.actions

export default localPlaylists.reducer
export const selectLocalPlaylist = (state: RootState) => state.localPlaylists
