import { selectPlaylist } from '@/store/playlistReducers'
import { Store, useCustomContext } from '@/store/reactContext'
import { Playitem } from '@/typescript/interfaces'
import { Button, Icon, List, ListItem, Popover, f7 } from 'framework7-react'
import React, {
    useState,
    type ReactElement,
    BaseSyntheticEvent,
    useEffect,
    useRef,
} from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

export interface SearchButtonProps {}

export default function SearchButton(): ReactElement {
    const initSearchState: {
        result: Playitem[]
        index: number
    } = {
        result: [],
        index: 0,
    }
    const { t } = useTranslation()
    const playlist = useSelector(selectPlaylist)
    const inputRef = useRef<HTMLInputElement>(null)
    const { setSearch, scrollToPlaying } = useCustomContext(Store)
    const [searchResult, setSearchResult] = useState(initSearchState)

    // Triggered when user inputs in the search,
    // Find matches in current playlist and assign to searchResulk
    const handleSearch = (e: BaseSyntheticEvent) => {
        const searchTerm = e.target.value
        if (searchTerm.trim() === '') {
            setSearchResult(initSearchState)
        } else {
            const playlistMatch = playlist.filter((item) =>
                item.title.toLowerCase().includes(searchTerm.toLowerCase())
            )
            setSearchResult({
                result: playlistMatch,
                index: 0,
            })
        }
    }
    // Triggered when user click Next arrow button
    const searchNext = () => {
        setSearchResult((prevState) => {
            return {
                ...prevState,
                index: prevState.index + 1,
            }
        })
    }
    // Triggered when user click Previous arrow button
    const searchPrev = () => {
        setSearchResult((prevState) => {
            return {
                ...prevState,
                index: prevState.index - 1,
            }
        })
    }
    // Triggered when user close the popover
    const resetSearch = () => {
        setSearchResult(initSearchState);
        if (inputRef.current !== null) {
            inputRef.current.value = ''
        }
    }
    // Watch the value of searchResult
    // Will call setSearch (in playlist.tsx) when lenght of search results is not 0
    useEffect(() => {
        if (
            searchResult !== initSearchState &&
            searchResult.result.length !== 0
        ) {
            setSearch(searchResult.result[searchResult.index].id)
        }
    }, [searchResult])

    return (
        <>
            {/* Button at control bar */}
            <Button
                popoverOpen=".search-popover"
                tooltip={t('playlist:Search-in-current-playlist')}
                className="m-0">
                <Icon f7="search_circle" className="text-[1.2rem]"></Icon>
            </Button>
            {/* Popover */}
            <Popover className="search-popover" backdrop={false} arrow={false} onPopoverClosed={resetSearch} onPopoverOpen={() => inputRef.current?.focus()}>
                <List className="cursor-pointer">
                {/* First item: let user to focus on current playlist item */}
                    <ListItem
                        onClick={() => scrollToPlaying()}
                        className="popover-close">
                        <div className="flex justify-start">
                            <Icon
                                f7="music_note_list"
                                className="mr-4 text-[1.2rem]"
                            />
                            <p>{t('playlist:Scroll-to-current-playing')}</p>
                        </div>
                    </ListItem>
                    {/* Search input and corresponding controls */}
                    <ListItem className="flex justify-around">
                        <input
                            type="search"
                            placeholder={t('playlist:Search')}
                            onChange={handleSearch}
                            ref={inputRef}
                        />
                        {searchResult !== initSearchState && (
                            <>
                                {/* Hint text for showing current index and total number of search results */}
                                <p>
                                    {Math.min(
                                        searchResult.index + 1,
                                        searchResult.result.length
                                    )}
                                    /{searchResult.result.length}
                                </p>

                                {/* Button for prev search result */}
                                <Button
                                    disabled={
                                        searchResult.index === 0 ||
                                        searchResult.result.length === 0
                                    }
                                    onClick={searchPrev}>
                                    <Icon
                                        f7="arrow_left"
                                        className="text-[1rem]"
                                    />
                                </Button>

                                {/* Button for next search result */}
                                <Button
                                    disabled={
                                        searchResult.index ===
                                            searchResult.result.length - 1 ||
                                        searchResult.result.length === 0
                                    }
                                    onClick={searchNext}>
                                    <Icon
                                        f7="arrow_right"
                                        className="text-[1rem]"
                                    />
                                </Button>
                            </>
                        )}
                    </ListItem>
                </List>
            </Popover>
        </>
    )
}
