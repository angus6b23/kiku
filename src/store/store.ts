import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist-indexeddb-storage'
import playlistReducer from '@/store/playlistReducers'
import playerReducer from '@/store/playerReducers'
import searchReducer from '@/store/searchReducers'
import configReducer from '@/store/globalConfig'
import blobReducer from '@/store/blobStorage'
import localPlaylistReducer from '@/store/localPlaylistReducers'

const persistConfig = {
    key: 'root',
    storage: storage('kiku-db'),
    whitelist: ['config', 'localBlobs', 'localPlaylists'],
}

const rootReducer = combineReducers({
    playlist: playlistReducer,
    player: playerReducer,
    search: searchReducer,
    config: configReducer,
    localBlobs: blobReducer,
    localPlaylists: localPlaylistReducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)
const store = configureStore({
    reducer: persistedReducer,
})

const persistor = persistStore(store)

export { persistor, store }
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
