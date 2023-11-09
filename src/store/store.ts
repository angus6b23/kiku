import { configureStore } from '@reduxjs/toolkit'
import playlistReducer from '@/store/playlist'
import playerReducer from '@/store/player'
import searchReducer from '@/store/search'
import configReducer from '@/store/globalConfig'

const store = configureStore({
    reducer: {
        playlist: playlistReducer,
        player: playerReducer,
        search: searchReducer,
        config: configReducer,
    },
})
export default store
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
