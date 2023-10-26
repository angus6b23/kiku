import { PlayerState, PlayerAction, Playitem, PlaylistAction, SearchState, SearchAction } from "./interfaces"

const searchReducer = (state: SearchState, action: SearchAction) => {
    const { type, payload } = action
    switch (type) {
        case 'INV_SEARCH':
            return {
            ...state,
            results: payload,
        }
        case 'LOAD_MORE':
            return {
            ...state,
            page: state.page + 1,
            results: [...state.results, ...payload],
        }
        default:
            throw new Error('Unknown action type in search reducer')
    }
}
const playlistReducer = (state: Playitem[], action: PlaylistAction) => {
    const { type, payload } = action
    switch (type) {
        case 'ADD':
            return [...state, payload]
        case 'REMOVE':
            return state.filter((item) => item.id !== payload)
        case 'SET_STREAM':
            return state.map((item) => {
                if (item.id === payload.id) {
                    return { ...item, streamUrl: payload.url, audioFormat: payload.type }
                } else {
                    return item
                }
            })
        case 'SET_DOWNLOADING':
            return state.map((item) =>
                item.id === payload
                ? { ...item, downloadStatus: 'downloading' }
                : item
            )
        case 'SET_BLOB':
            return state.map((item) =>
                item.id === payload.id
                ? {
                    ...item,
                    downloadStatus: 'downloaded',
                    audioBlob: payload.res,
                }
                : item
            )
        case 'SET_PLAYING':
            return state.map((item) =>{ 
                if (item.id === payload.id){
                    return {
                        ...item,
                        status: 'playing'
                    }
                } else if (item.status === 'playing'){
                    return {
                        ...item,
                        status: 'played'
                    }
                } else {
                    return item
                }
            });
    }
}
const playerReducer = (state: PlayerState, action: PlayerAction) => {
    const { type, payload } = action
    switch(type){
        case "SELECT_SONG":
            return {
                ...state,
                currentPlaying: payload,
                playing: true,
            }
    }
    return state
}
const useAudio = (audio: HTMLAudioElement, source: HTMLSourceElement, action: PlayerAction) => {
    const { type, payload } = action;
    switch(type){
        case "SELECT_SONG":
            console.log(payload);
            audio.src = URL.createObjectURL(payload.audioBlob);
            audio.load();
            audio.play();
            break;
        default:
            throw new Error('Unknown action type in useAudio()')
    }
}
export { playlistReducer, playerReducer, searchReducer, useAudio }
