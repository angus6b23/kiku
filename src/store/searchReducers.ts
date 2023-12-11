import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { SearchResult, SearchState } from '@/typescript/interfaces'
import { RootState } from './store'

const initiSearchState: SearchState = {
    searchTerm: '',
    page: 1,
    sort_by: 'relevance',
    type: 'all',
    region: 'US',
    results: [],
}

interface NewSearch {
    res: SearchResult[]
    searchTerm: string
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
