import React, { useRef, useState, useEffect } from 'react'
import {
    Page,
    Block,
    Button,
    Segmented,
    Searchbar,
    Subnavbar,
    f7,
} from 'framework7-react'

import { handleSuggest } from '../js/suggestions'
import { handleSearchVideo } from '../js/search'
import { useDispatch, useSelector } from 'react-redux'
import { newSearch, selectSearch } from '@/store/searchReducers'
import { Store, useCustomContext } from '@/components/context'
import Innertube from 'youtubei.js/agnostic'
import { selectConfig } from '@/store/globalConfig'
import { useTranslation } from 'react-i18next'
import { Instance, SearchContinuation } from '@/components/interfaces'
import presentToast from './Toast'
import {getPlayitem} from '@/js/fetchInfo'
import {addToPlaylist} from '@/store/playlistReducers'

interface MainNavProps {
    tab: string
    setTab: (arg0: string) => void
}
interface SearchbarSelf {
    searchbar: any
}

declare const self: Window & typeof globalThis & SearchbarSelf

const MainNav = (props: MainNavProps) => {
    const [searchTerm, setSearchTerm] = useState('')
    useState<SearchContinuation>(undefined)
    const { innertube }: { innertube: React.RefObject<Innertube> } =
        useCustomContext(Store)
    const config = useSelector(selectConfig)
    const instance = useRef(config.instance.preferType) // Use reference for f7 autocomplete

    const autocompleteSearch = useRef<any>(null)
    const onPageBeforeRemove = () => {
        autocompleteSearch.current.destroy()
    }
    const search = useSelector(selectSearch)
    const { setContinuation } = useCustomContext(Store)
    const dispatch = useDispatch()
    const { t } = useTranslation(['common'])

    // Use useEffect hook to setup the autosuggest bar since the page is not wrapped in View, the page init would not work
    useEffect(() => {
        onPageInit()
        return onPageBeforeRemove
    }, [])

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
        props.setTab('main')
        autocompleteSearch.current.close()
        f7.preloader.show()
        let fullfilled = false
        // Try to scan for url on input
        try {
            const url = new URL(searchTerm) // Will jump to catch if fail
            let id: string | null;
            let playlistId: string | null;
            // Extract parameters and path from url to get video id
            if (url.hostname === 'youtu.be') {
                id = url.pathname.replaceAll('/', '')
                playlistId = null
            } else {
                id = url.searchParams.get('v')
                playlistId = url.searchParams.get('list')
            }
            // Skip if fail to get video id
            if (id === null && playlistId === null){
                throw new Error('')
            }
            // Browse playlist if playlist is found
            if (playlistId !== null){
                fullfilled = true;
                f7.views.get('#page-router').router.navigate(`playlist/${playlistId}`)
            }
            // Fetch basic information on given video id
            const res = await getPlayitem(id as string, config.instance.preferType, innertube.current)
            if (res instanceof Error){
                presentToast('error', res.message)
                throw res
            } else {
                // Add item to playlist if successful and end the function
                dispatch(addToPlaylist(res));
                fullfilled = true;
                return;
            }
        } catch {
            console.debug('Search term is not a valid url')
        }
        if (fullfilled){
            f7.preloader.hide()
            return
        }
        // Search with keyword starts here
        try {
            const res = await handleSearchVideo(
                searchTerm,
                { ...search, page: 1 },
                config.instance.preferType,
                innertube.current
            )
            dispatch(newSearch({ res: res.data, searchTerm: searchTerm }))
            setContinuation(res.continuation)
        } catch (err) {
            presentToast('error', err as string)
        }
        f7.preloader.hide()
    }

    useEffect(() => {
        // Sync Instance settings with local ref
        instance.current = config.instance.preferType
    }, [config.instance.preferType])

    return (
        <Page
            name="MainNav"
            onPageInit={onPageInit}
            onPageBeforeRemove={onPageBeforeRemove}
            className="h-28 overflow-visible z-50"
        >
            {/* Top Navbar */}
            <Subnavbar inner={false} className="flex p-2">
                <Searchbar
                    init={false}
                    placeholder={t('common:Search-here')}
                    clearButton={true}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    id="searchbar-autocomplete"
                    onSubmit={handleSearch}
                    value={searchTerm}
                />
                <Button onClick={handleSearch}>{t('common:Search')}</Button>
            </Subnavbar>
            {/* Tab Buttons */}
            <Block className="sticky top-0 z-10 my-0 px-0">
                <Segmented strong>
                    <Button
                        active={props.tab === 'now-playing'}
                        onClick={() => props.setTab('now-playing')}
                    >
                        {t('common:Now-Playing')}
                    </Button>
                    <Button
                        active={props.tab === 'main'}
                        onClick={() => props.setTab('main')}
                    >
                        {t('common:Search-Result')}
                    </Button>
                    <Button
                        active={props.tab === 'setting'}
                        onClick={() => props.setTab('setting')}
                    >
                        {t('common:Setting')}
                    </Button>
                </Segmented>
            </Block>
        </Page>
    )
}
export default MainNav
