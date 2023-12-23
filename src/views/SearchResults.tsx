import React, { useRef, type ReactElement, useEffect } from 'react'
import VideoResultCard from '@/components/VideoResultCard'
import PlaylistResultCard from '@/components/PlaylistResultCard'
import {
    f7,
    Block,
    BlockTitle,
    Button,
    Icon,
    Page,
    Toolbar,
    Navbar,
    NavLeft,
    Link,
    NavTitle,
} from 'framework7-react'
import { nanoid } from 'nanoid'
import { useDispatch, useSelector } from 'react-redux'
import { selectSearch, nextPage, newSearch } from '@/store/searchReducers'
import { handleContinuation, handleSearchVideo } from '@/js/search'
import { selectConfig } from '@/store/globalConfig'
import Innertube from 'youtubei.js/agnostic'
import { Store, useCustomContext } from '@/store/reactContext'
import { Continuation } from '@/typescript/interfaces'
import ChannelResultCard from '@/components/ChannelResultCard'
import { useTranslation } from 'react-i18next'
import NoResult from '@/views/Search-modules/NoResult'
import presentToast from '@/components/Toast'

interface SearchResultsProps {
    searchTerm: string
}

export default function SearchResults(props: SearchResultsProps): ReactElement {
    const search = useSelector(selectSearch)
    const config = useSelector(selectConfig)
    const { t } = useTranslation(['search-result', 'common'])
    const {
        innertube,
        continuation,
        setContinuation,
    }: {
        innertube: React.RefObject<null | Innertube>
        continuation: Continuation
        setContinuation: (arg0: Continuation) => void
    } = useCustomContext(Store)
    useCustomContext(Store)
    const resultTop = useRef<HTMLElement>(null)
    const dispatch = useDispatch()

    const handleLoadMore = async () => {
        try {
            f7.preloader.showIn('#page-router')
            const res = await handleContinuation(
                search,
                continuation,
                config.instance.preferType,
                innertube.current
            )
            dispatch(nextPage(res.data))
            setContinuation(res.continuation)
            f7.preloader.hideIn('#page-router')
        } catch {
            setContinuation(undefined)
            f7.preloader.hideIn('#page-router')
        }
    }
    useEffect(() => {
        f7.preloader.showIn('#page-router')
        handleSearchVideo(
            props.searchTerm,
            search,
            config.instance.preferType,
            innertube.current
        )
            .then((res) => {
                dispatch(
                    newSearch({ res: res.data, searchTerm: props.searchTerm })
                )
                setContinuation(res.continuation)
                f7.preloader.hideIn('#page-router')
            })
            .catch((err) => {
                presentToast('error', err)
                f7.preloader.hideIn('#page-router')
            })
    }, [props.searchTerm])
    useEffect(() => {
        if (search.page === 1) {
            resultTop.current?.scrollIntoView({ block: 'end' })
        }
    }, [search])
    return (
        <Page name="search-result" className="h-page overflow-auto">
            <Navbar>
                <NavLeft>
                    <Link href="/">
                        <Icon f7="house_fill" />
                    </Link>
                    <Link back>
                        <Icon f7="chevron_left" />
                    </Link>
                </NavLeft>
                <NavTitle>
                    {t('common:Search-Results')}: {props.searchTerm}
                </NavTitle>
            </Navbar>
            {search.results.length === 0 ? (
                <NoResult />
            ) : (
                <div>
                    <BlockTitle>
                        <span ref={resultTop} className="text-2xl">
                            {t('search-result:Search-Results')}{' '}
                            {search.searchTerm}
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
            <Toolbar bottom className="bg-transparent"></Toolbar>
        </Page>
    )
}
