import React, { useEffect, type ReactElement, useState } from 'react'
import {
    Button,
    Page,
    Navbar,
    NavLeft,
    Link,
    Block,
    NavTitle,
    Icon,
    f7,
    Toolbar,
} from 'framework7-react'
import { useSelector } from 'react-redux'
import { selectConfig } from '@/store/globalConfig'
import { fetchChannelDetails } from '@/js/channel'
import { Store, useCustomContext } from '@/components/context'
import Innertube from 'youtubei.js/agnostic'
import { ChannelData } from '@/components/interfaces'
import { nanoid } from 'nanoid'
import VideoResultCard from '@/components/VideoResultCard'
import { selectSearch } from '@/store/searchReducers'
import { Router } from 'framework7/types'
import presentToast from '@/components/Toast'

export interface ChannelViewProps {
    channelId: string
    f7router: Router
}

export default function ChannelView(props: ChannelViewProps): ReactElement {
    const config = useSelector(selectConfig)
    const search = useSelector(selectSearch)
    const [channel, setChannel] = useState<ChannelData | undefined>(undefined)
    const { innertube }: { innertube: React.RefObject<Innertube | null> } =
        useCustomContext(Store)

    // Auto fetch channel details when changing channel
    useEffect(() => {
        f7.preloader.show()
        fetchChannelDetails(
            props.channelId,
            config.instance.preferType,
            innertube.current
        )
        .then((res) => {
            if (!(res instanceof Error)) {
                setChannel(res)
                f7.preloader.hide()
            } else {
                throw res
            }
        })
        .catch((err) => {
            f7.preloader.hide()
            presentToast('error', err)
        })
    }, [props.channelId])

    // Nagvigate back to search results automatically when user create a new search
    useEffect(() => {
        props.f7router.navigate('/')
    }, [search.searchTerm])

    return (
        <Page>
            <Navbar>
                <NavLeft>
                    <Link href="/">
                        <Icon f7="chevron_left" />
                    </Link>
                </NavLeft>
                <NavTitle>Channel {channel?.channelInfo.name}</NavTitle>
            </Navbar>
            {channel !== undefined && channel.videos.length > 0 && (
                <Block className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {channel.videos.map((item) => (
                        <VideoResultCard
                            key={nanoid()}
                            data={item}
                        />
                    ))}
                </Block>
            )}
            {

            }
            <Block className="flex items-center justify-center mx-4">
                <Button
                    raised
                    fill
                    className="w-1/2"
                >
                    <Icon
                        f7="chevron_down_circle"
                        className="mr-2"
                    />
                    Load More
                </Button>
            </Block>
            <Toolbar bottom className="bg-transparent">
            </Toolbar>
        </Page>
    )
}
