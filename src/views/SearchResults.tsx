import React, { useRef, type ReactElement, useEffect } from 'react'
import SearchResultCard from '../components/SearchResultCard'
import { Block, BlockTitle, Button, Icon } from 'framework7-react'
import { nanoid } from 'nanoid'
import { useSelector } from 'react-redux'
import { selectSearch } from '@/store/search'
import NoResult from '@/components/NoResult'

interface SearchResultsProps {
    handleLoadMore: () => void
}

export default function SearchResults(props: SearchResultsProps): ReactElement {
    const search = useSelector(selectSearch)
    const resultTop = useRef<HTMLElement>(null)
    useEffect(() => {
        if (search.page === 1) {
            resultTop.current?.scrollIntoView({ block: 'end' })
        }
    }, [search])
    return (
        <>
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
                                <SearchResultCard
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
                                onClick={props.handleLoadMore}
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
        </>
    )
}
