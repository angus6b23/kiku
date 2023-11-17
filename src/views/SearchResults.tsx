import React, { useRef, type ReactElement, useEffect, useState } from 'react'
import VideoResultCard from '@/components/VideoResultCard'
import PlaylistResultCard from '@/components/PlaylistResultCard'
import { f7, Block, BlockTitle, Button, Icon, Page, Popup } from 'framework7-react'
import { nanoid } from 'nanoid'
import { useDispatch, useSelector } from 'react-redux'
import { selectSearch } from '@/store/search'
import NoResult from '@/components/NoResult'
import ChannelView from './ChannelView'
import { handleContinuation } from '@/js/search'
import {selectConfig} from '@/store/globalConfig'
import Innertube from 'youtubei.js/agnostic'
import {Store, useCustomContext} from '@/components/context'
import { nextPage } from '@/store/search'

interface SearchResultsProps {
    handleLoadMore: () => void
}

export default function SearchResults(props: SearchResultsProps): ReactElement {
    const search = useSelector(selectSearch)
    const config = useSelector(selectConfig)
    const { innertube }: { innertube: React.RefObject<Innertube | null>} = useCustomContext(Store)
    const resultTop = useRef<HTMLElement>(null)
    const dispatch = useDispatch()
    const [channel, setChannel] = useState<string>('')
    const [channelIsOpen, setChannelIsOpen] = useState<boolean>(false)
    const handleViewChannel = (id: string) =>{
        setChannel(id)
        setChannelIsOpen(true);
    }

    const handleLoadMore = async () => {
        f7.preloader.show()
        const res = await handleContinuation(
            search,
            search.continuation,
            config.instance.preferType,
            innertube.current
        )
        dispatch(nextPage(res.data))
        f7.preloader.hide()
    }
    useEffect(() => {
        if (search.page === 1) {
            resultTop.current?.scrollIntoView({ block: 'end' })
        }
    }, [search])
    return (
        <Page
            name='search-result'
            className="h-[calc(100vh-7rem)] overflow-auto"
        >
            {search.results.length === 0 ? (
                <NoResult />
            ) : (
                <div>
                    <BlockTitle>
                        <span ref={resultTop} className="text-2xl">
                            Search Results: {search.searchTerm}
                        </span>
                    </BlockTitle>
                    <Block className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        {search.results.map((result) =>
                                            result.type === 'video' ? (
                                                <VideoResultCard key={nanoid()} data={result} handleViewChannel={handleViewChannel} />
                        ) : result.type === 'playlist' ? (
                            <PlaylistResultCard
                                key={nanoid()}
                                data={result}
                            />
                        ) : (
                            <></>
                        )
                                           )}
                    </Block>
                    {/* Show 'Load More' button after search */}
                    {search.results.length > 0 && (
                        <Block className="flex items-center justify-center mx-4">
                            <Button
                                raised
                                fill
                                className="w-1/2"
                                onClick={handleLoadMore}
                            >
                                <Icon
                                    f7="chevron_down_circle"
                                    className="mr-2"
                                />
                                Load More
                            </Button>
                        </Block>
                    )}
                </div>
            )}
        </Page>
    )
}
