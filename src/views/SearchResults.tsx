import React, { type ReactElement } from 'react'
import { SearchContext, useCustomContext } from '../components/context'
import { Search } from '../components/interfaces'
import SearchResultCard from '../components/SearchResultCard'
import { Block, BlockTitle, Button, Icon } from 'framework7-react'

interface SearchResultsProps {
    loadMore: () => void
}
export default function SearchResults(props: SearchResultsProps): ReactElement {
    const search = useCustomContext<Search>(SearchContext)
    return (
        <>
            <BlockTitle>Search Results</BlockTitle>
            <Block className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {search.results.map((result) =>
                    result.type === 'video' ? (
                        <SearchResultCard key={result.videoId} data={result} />
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
                        onClick={props.loadMore}
                    >
                        <Icon f7="chevron_down_circle" className="mr-2" />
                        Load More
                    </Button>
                </Block>
            )}
        </>
    )
}
