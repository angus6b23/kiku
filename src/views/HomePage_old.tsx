import React, { useRef, useState, useEffect } from 'react'
import {
    Page,
    Toolbar,
    Block,
    Button,
    Tab,
    Segmented,
    Searchbar,
    Subnavbar,
    View,
    f7,
    Tabs,
} from 'framework7-react'

import { handleSuggest } from '../js/suggestions'
import { handleContinuation, handleSearchVideo } from '../js/search'
import SearchResults from '../views/SearchResults'
import NowPlaying from '../views/NowPlaying'
import ToolbarPlayer from '@/components/ToolbarPlayer'
import { useDispatch, useSelector } from 'react-redux'
import { selectPlayer } from '@/store/player'
import { newSearch, nextPage, selectSearch } from '@/store/search'
import Setting from './Setting'
import { Store, useCustomContext } from '@/components/context'
import Innertube from 'youtubei.js/agnostic'
import { selectConfig } from '@/store/globalConfig'
import { useTranslation } from 'react-i18next'
import { SearchContinuation } from '@/components/interfaces'

interface SearchbarSelf {
    searchbar: any
}
declare const self: Window & typeof globalThis & SearchbarSelf

const HomePage = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [continuation, setContinuation] =
        useState<SearchContinuation>(undefined)
    const [tab, setTab] = useState('now-playing')
    const { innertube }: { innertube: React.RefObject<Innertube> } =
        useCustomContext(Store)
    const playerState = useSelector(selectPlayer)
    const config = useSelector(selectConfig)
    const instance = useRef(config.instance.preferType) // Use reference for f7 autocomplete

    const autocompleteSearch = useRef<any>(null)
    const onPageBeforeRemove = () => {
        autocompleteSearch.current.destroy()
    }
    const search = useSelector(selectSearch)
    const dispatch = useDispatch()
    const { t } = useTranslation(['common'])

    const onPageInit = () => {
        autocompleteSearch.current = f7.autocomplete.create({
            openIn: 'dropdown',
            inputEl: '#searchbar-autocomplete input[type="search"]',
            async source(query, render) {
                let results = await handleSuggest(
                    query,
                    instance.current, //Use ref instead of config directly as f7.autocomplete.create will not sync with config
                    innertube.current
                )
                results = results.map((text: string) => decodeURI(text))
                render(results)
            },
            on: {
                change: (e: string[]) => {
                    setSearchTerm(e[0])
                },
            },
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
        // handleSearchVideo(searchTerm: string, options: Search, instances: Instance[], innertube: Innertube | null)
        const res = await handleSearchVideo(
            searchTerm,
            { ...search, page: 1 },
            config.instance.preferType,
            innertube.current
        )
        setContinuation(res.continuation)
        dispatch(newSearch({ res: res.data, searchTerm: searchTerm }))

        f7.preloader.hide()
    }
    const handleLoadMore = async () => {
        f7.preloader.show()
        const res = await handleContinuation(
            search,
            continuation,
            config.instance.preferType,
            innertube.current
        )
        dispatch(nextPage(res.data))
        // const res = await searchInv(
        //     searchTerm,
        //     { ...search, page: newPage },
        //     config.instance.preferType[1].url
        // )
        // dispatch(nextPage(res))
        f7.preloader.hide()
    }

    useEffect(() => {
        // Sync Instance settings with local ref
        instance.current = config.instance.preferType
    }, [config.instance.preferType])
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
                <Button onClick={handleSearch}>{t('common:Search')}</Button>
            </Subnavbar>
            <Block className="sticky top-0 z-10 my-0 px-0">
                <Segmented strong>
                    <Button
                        active={tab === 'now-playing'}
                        onClick={() => setTab('now-playing')}
                    >
                        {t('common:Now-Playing')}
                    </Button>
                    <Button
                        active={tab === 'search-results'}
                        onClick={() => setTab('search-results')}
                    >
                        {t('common:Search-Result')}
                    </Button>
                    <Button
                        active={tab === 'settings'}
                        onClick={() => setTab('settings')}
                    >
                        {t('common:Setting')}
                    </Button>
                </Segmented>
            </Block>
            {/* Toolbar */}
            <Block>
                {/* <View> */}
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
                {/* </View> */}
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
