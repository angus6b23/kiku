import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { SearchResult, SearchState } from '@/components/interfaces'
import { RootState } from './store'
import { Search } from 'youtubei.js/dist/src/parser/youtube'

const initiSearchState: SearchState = {
    searchTerm: '',
    page: 1,
    sort_by: 'relevance',
    type: 'all',
    region: 'US',
    results: [],
    continuation: undefined
}

interface NewSearch {
    res: SearchResult[]
    searchTerm: string
    continuation: string | undefined | Search
}

export const search = createSlice({
    name: 'search',
    initialState: initiSearchState,
    reducers: {
        newSearch: (state, action: PayloadAction<NewSearch>) => {
            return {
                ...state,
                page: 1,
                searchTerm: action.payload.searchTerm,
                results: action.payload.res,
                continuation: action.payload.continuation
            }
        },
        nextPage: (state, action: PayloadAction<SearchResult[]>) => {
            return {
                ...state,
                page: state.page + 1,
                results: [...state.results, ...action.payload],
            }
        },
    },
})

export const { newSearch, nextPage } = search.actions

export default search.reducer
export const selectSearch = (state: RootState) => state.search
