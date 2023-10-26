import React, { useRef, useState, useReducer } from 'react'
import { SearchContext } from '../components/context'
import {
    Page,
    Navbar,
    NavTitle,
    Link,
    Toolbar,
    Block,
    BlockTitle,
    List,
    ListItem,
    Button,
    Tab,
    Segmented,
    Searchbar,
    Subnavbar,
    f7,
    Tabs,
} from 'framework7-react'

import { suggestInv } from '../js/suggestions'
import { searchInv } from '../js/search'
import { Autocomplete } from 'framework7/types'
import { SearchState } from '../components/interfaces'
import { searchReducer } from '../components/reducers'
import SearchResults from '../views/SearchResults'
import NowPlaying from '../views/NowPlaying'
const initSearch: SearchState = {
    searchTerm: '',
    page: 1,
    sort_by: 'relevance',
    type: 'all',
    region: 'US',
    results: [],
}

const HomePage = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [search, dispatchSearch] = useReducer(searchReducer, initSearch);
    const [tab, setTab] = useState('now-playing');
    const autocompleteSearch = useRef<null | Autocomplete>(null)
    const onPageBeforeRemove = () => {
        autocompleteSearch.current.destroy()
    }
    const onPageInit = () => {
        autocompleteSearch.current = f7.autocomplete.create({
            openIn: 'dropdown',
            inputEl: '#searchbar-autocomplete input[type="search"]',
            async source(query, render) {
                let results = await suggestInv(query)
                results = results.map((text: string) => decodeURI(text))
                render(results)
            },
        })
        self.searchbar = f7.searchbar.create({
            el: '#searchbar-autocomplete',
            customSearch: true,
        })
    }
    const handleSearch = async () => {
        setTab('search-results')
        f7.preloader.show()
        const res = await searchInv(searchTerm, search)
        dispatchSearch({ type: 'INV_SEARCH', payload: res })
        f7.preloader.hide()
    }
    const handleLoadMore = async () => {
        f7.preloader.show()
        let { page } = search
        page += 1
        const res = await searchInv(searchTerm, { ...search, page: page })
        console.log(res)
        dispatchSearch({ type: 'LOAD_MORE', payload: res })
        f7.preloader.hide()
    }
    return (
        <Page
            name="home"
            onPageInit={onPageInit}
            onPageBeforeRemove={onPageBeforeRemove}
        >
            {/* Top Navbar */}
            <Navbar>
                <Subnavbar inner={false} className="flex p-2">
                    <Searchbar
                        init={false}
                        placeholder="Search Video"
                        clearButton={true}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        id="searchbar-autocomplete"
                        onSubmit={handleSearch}
                    />
                    <Button onClick={handleSearch}>Search</Button>
                </Subnavbar>
            </Navbar>
            <Block className="sticky top-0 z-10 my-0 px-0">
                <Segmented strong>
                    <Button active={ tab === "now-playing" } onClick={()=>setTab('now-playing')}>Now Playing</Button>
                    <Button active={ tab === "search-results" } onClick={()=>setTab('search-results')}>Search Results</Button>
                    <Button active={ tab === "settings" } onClick={()=>setTab('settings')}>Settings</Button>
                </Segmented>
            </Block>
            {/* Toolbar */}
            <Block>

                <Tabs>
                    <Tab tabActive={tab === "now-playing"}>
                        <NowPlaying />
                    </Tab>
                    <Tab tabActive={tab === "search-results"}>

                        <SearchContext.Provider value={search}>
                            <SearchResults loadMore={handleLoadMore} />
                        </SearchContext.Provider>
                    </Tab>
                </Tabs>
            </Block>
            <Toolbar bottom>
                <Link>Place holder for player</Link>
            </Toolbar>
            {/* Page content */}

        </Page>
    )
}
export default HomePage
