import {
    SearchState,
    SearchAction,
    AudioBlobObject,
    AudioBlobAction,
} from '@/typescript/interfaces'

const searchReducer = (state: SearchState, action: SearchAction) => {
    const { type, payload } = action
    switch (type) {
        case 'NEW_SEARCH':
            return {
                ...state,
                page: 1,
            }
        case 'INV_SEARCH':
            return {
                ...state,
                results: payload,
                page: 1,
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
const blobStoreReducer = (
    state: AudioBlobObject[],
    action: AudioBlobAction
) => {
    const { type, payload } = action
    switch (type) {
        case 'ADD_BLOB':
            return [...state, { id: payload.id, blob: payload.blob }]
        case 'REMOVE_BLOB':
            return state.filter((item) => item.id != payload.id)
    }
}

export { searchReducer, blobStoreReducer }
