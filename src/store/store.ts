import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist-indexeddb-storage'
import playlistReducer from '@/store/playlist'
import playerReducer from '@/store/player'
import searchReducer from '@/store/search'
import configReducer from '@/store/globalConfig'

const persistConfig = {
    key: 'root',
    storage: storage('kiku-db'),
    whitelist: ['config']
}

const rootReducer = combineReducers({
    playlist: playlistReducer,
    player: playerReducer,
    search: searchReducer,
    config: configReducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)
const store = configureStore({
    reducer: persistedReducer
})

const persistor = persistStore(store)

export {persistor, store}
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

