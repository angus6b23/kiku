import { PlayerState, Playitem } from '@/components/interfaces'
import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { RootState } from './store'

const initPlayer: PlayerState = {
    currentPlaying: undefined,
    status: 'stopped',
}

export const player = createSlice({
    name: 'player',
    initialState: initPlayer,
    reducers: {
        play: (state) => {
            return state.currentPlaying === undefined
                ? state
                : { ...state, status: 'playing' }
        },
        pause: (state) => {
            return { ...state, status: 'paused' }
        },
        stop: (state) => {
            return { ...state, status: 'stopped' }
        },
        setSong: (state, action: PayloadAction<Playitem | undefined>) => {
            return { ...state, currentPlaying: action.payload }
        },
        togglePlay: (state) => {
            return state.currentPlaying === undefined
                ? state
                : {
                      ...state,
                      status: state.status === 'playing' ? 'paused' : 'playing',
                  }
        },
    },
})

export const { play, pause, stop, setSong, togglePlay } = player.actions

export default player.reducer
export const selectPlayer = (state: RootState) => state.player
