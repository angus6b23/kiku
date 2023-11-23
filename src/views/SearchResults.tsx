import React, { useRef, type ReactElement, useEffect } from 'react'
import VideoResultCard from '@/components/VideoResultCard'
import PlaylistResultCard from '@/components/PlaylistResultCard'
import { f7, Block, BlockTitle, Button, Icon, Page, Toolbar } from 'framework7-react'
import { nanoid } from 'nanoid'
import { useDispatch, useSelector } from 'react-redux'
import { selectSearch, nextPage } from '@/store/searchReducers'
import NoResult from '@/components/NoResult'
import { handleContinuation } from '@/js/search'
import { selectConfig } from '@/store/globalConfig'
import Innertube from 'youtubei.js/agnostic'
import { Store, useCustomContext } from '@/components/context'
import { Continuation } from '@/components/interfaces'
import ChannelResultCard from '@/components/ChannelResultCard'
import {useTranslation} from 'react-i18next'

export default function SearchResults(): ReactElement {
    const search = useSelector(selectSearch)
    const config = useSelector(selectConfig)
    const { t } = useTranslation(['search-result', 'common'])
    const {
        continuation,
        setContinuation,
    }: {
        continuation: Continuation
        setContinuation: (arg0: Continuation) => void
    } = useCustomContext(Store)
    const { innertube }: { innertube: React.RefObject<Innertube | null> } =
        useCustomContext(Store)
    const resultTop = useRef<HTMLElement>(null)
    const dispatch = useDispatch()

    const handleLoadMore = async () => {
        f7.preloader.show()
        const res = await handleContinuation(
            search,
            continuation,
            config.instance.preferType,
            innertube.current
        )
        dispatch(nextPage(res.data))
        setContinuation(res.continuation)
        f7.preloader.hide()
    }
    useEffect(() => {
        if (search.page === 1) {
            resultTop.current?.scrollIntoView({ block: 'end' })
        }
    }, [search])
    return (
        <Page name="search-result" className="h-page overflow-auto">
            {search.results.length === 0 ? (
                <NoResult />
            ) : (
                <div>
                    <BlockTitle>
                        <span ref={resultTop} className="text-2xl">
                            {t('search-result:Search-Results')} {search.searchTerm}
                        </span>
                    </BlockTitle>
                    <Block className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        {search.results.map((result) =>
                            result.type === 'video' ? (
                                <VideoResultCard key={nanoid()} data={result} />
                            ) : result.type === 'playlist' ? (
                                <PlaylistResultCard
                                    key={nanoid()}
                                    data={result}
                                />
                            ) : result.type === 'channel' ? (
                                <ChannelResultCard
                                    data={result}
                                    key={nanoid()}
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
                                {t('common:Load-More')}
                            </Button>
                        </Block>
                    )}
                </div>
            )}
                    <Toolbar bottom className="bg-transparent">
                    </Toolbar>
        </Page>
    )
}
