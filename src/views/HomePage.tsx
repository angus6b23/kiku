import React, { useRef, useState } from 'react'
import {
    Page,
    Toolbar,
    Block,
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
import SearchResults from '../views/SearchResults'
import NowPlaying from '../views/NowPlaying'
import ToolbarPlayer from '@/components/ToolbarPlayer'
import { useDispatch, useSelector } from 'react-redux'
import { selectPlayer } from '@/store/player'
import { newSearch, nextPage, selectSearch } from '@/store/search'
import Setting from './Setting'

interface SearchbarSelf{
    searchbar: any
}
declare const self: Window & typeof globalThis & SearchbarSelf

const HomePage = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [tab, setTab] = useState('now-playing')
    const  playerState = useSelector(selectPlayer)
    const autocompleteSearch = useRef<any>(null)
    const onPageBeforeRemove = () => {
        autocompleteSearch.current.destroy()
    }
    const search = useSelector(selectSearch)
    const dispatch = useDispatch()

    const onPageInit = () => {
        autocompleteSearch.current = f7.autocomplete.create({
            openIn: 'dropdown',
            inputEl: '#searchbar-autocomplete input[type="search"]',
            async source(query, render) {
                let results = await suggestInv(query)
                results = results.map((text: string) => decodeURI(text))
                render(results)
            },
            on: {
                change: (e: string[])=> {
                    setSearchTerm(e[0])
                }
            }
        })
        self.searchbar = f7.searchbar.create({
            el: '#searchbar-autocomplete',
            customSearch: true,
        })
    }
    const handleSearch = async () => {
        setTab('search-results')
        autocompleteSearch.current.close()
        f7.preloader.show()
        const res = await searchInv(searchTerm, { ...search, page: 1 })
        dispatch(newSearch({ res: res, searchTerm: searchTerm }))
        f7.preloader.hide()
    }
    const handleLoadMore = async () => {
        f7.preloader.show()
        const newPage = search.page + 1
        const res = await searchInv(searchTerm, { ...search, page: newPage })
        dispatch(nextPage(res))
        f7.preloader.hide()
    }
    return (
        <Page
            name="home"
            onPageInit={onPageInit}
            onPageBeforeRemove={onPageBeforeRemove}
        >
            {/* Top Navbar */}
            <Subnavbar inner={false} className="flex p-2">
                <Searchbar
                    init={false}
                    placeholder="Search Video"
                    clearButton={true}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    id="searchbar-autocomplete"
                    onSubmit={handleSearch}
                    value={searchTerm}
                />
                <Button onClick={handleSearch}>Search</Button>
            </Subnavbar>
            <Block className="sticky top-0 z-10 my-0 px-0">
                <Segmented strong>
                    <Button
                        active={tab === 'now-playing'}
                        onClick={() => setTab('now-playing')}
                    >
                        Now Playing
                    </Button>
                    <Button
                        active={tab === 'search-results'}
                        onClick={() => setTab('search-results')}
                    >
                        Search Results
                    </Button>
                    <Button
                        active={tab === 'settings'}
                        onClick={() => setTab('settings')}
                    >
                        Settings
                    </Button>
                </Segmented>
            </Block>
            {/* Toolbar */}
            <Block>
                <Tabs>
                    <Tab tabActive={tab === 'now-playing'}>
                        <NowPlaying />
                    </Tab>
                    <Tab tabActive={tab === 'search-results'}>
                        <SearchResults handleLoadMore={handleLoadMore} />
                    </Tab>
                    <Tab tabActive={tab === 'settings'}>
                        <Setting />
                    </Tab>
                </Tabs>
            </Block>
            {tab !== 'now-playing' &&
                playerState.currentPlaying !== undefined && (
                    <Toolbar bottom>
                        <ToolbarPlayer
                            showNowPlaying={() => setTab('now-playing')}
                        />
                    </Toolbar>
            )}
            {/* Page content */}
        </Page>
    )
}
export default HomePage
