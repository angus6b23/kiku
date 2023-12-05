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
    Tab,
    Tabs,
    BlockTitle,
} from 'framework7-react'
import { useSelector } from 'react-redux'
import { selectConfig } from '@/store/globalConfig'
import { fetchChannelDetails, handleChannelContinuation } from '@/js/channel'
import { Store, useCustomContext } from '@/components/context'
import Innertube from 'youtubei.js/agnostic'
import { ChannelData, VideoDetails, VideoResult } from '@/components/interfaces'
import { nanoid } from 'nanoid'
import VideoResultCard from '@/components/VideoResultCard'
import { selectSearch } from '@/store/searchReducers'
import { Router } from 'framework7/types'
import presentToast from '@/components/Toast'
import { useTranslation } from 'react-i18next'
import PlaylistResultCard from '@/components/PlaylistResultCard'
import { getVideoDetail } from '@/js/videoDetail'
import { convertSecond } from '@/utils/format'

export interface DetailViewProps {
    videoId: string
    f7router: Router
}

export default function DetailView(props: DetailViewProps): ReactElement {
    const config = useSelector(selectConfig)
    const [details, setDetails] = useState<VideoDetails | undefined>(undefined)
    const { innertube } = useCustomContext(Store)
    const { t } = useTranslation(['common', 'search-result'])

    // Auto fetch channel details when changing channel
    useEffect(() => {
        // f7.preloader.show()
        getVideoDetail(
            props.videoId,
            config.instance.preferType,
            innertube.current
        ).then((res) => {
            console.log(res)
            if (res instanceof Error) {
                presentToast('error', res.message)
                setDetails(undefined)
            } else {
                setDetails(res)
            }
        })
    }, [props.videoId])

    return (
        <Page>
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
                    {t('search-result:Details')}{' '}
                    {details !== undefined && details.title}
                </NavTitle>
            </Navbar>
            {details !== undefined && (
                <>
                    <Block className="grid grid-cols-6">
                        <div className="col-span-3"></div>
                        <div className="col-span-3 flex flex-row flex-wrap justify-start items-center gap-6">
                            <h3 className="text-2xl w-full">{details.title}</h3>
                            <div>
                                <Link
                                    className="text-2xl underline w-full text-left"
                                    href={`/channel/${details.authorId}`}
                                >
                                    {details.author}
                                </Link>
                            </div>
                            <div className="grid grid-cols-6 w-full">
                                <div className="col-span-2">
                                    {t('video-detail:Duration')}
                                </div>
                                <div className="col-span-4">
                                    {convertSecond(details.lengthSeconds)}
                                </div>
                                <div className="col-span-2">
                                    {t('video-detail:Published-at')}
                                </div>
                                <div className="col-span-4">
                                    {details.published}
                                </div>
                                <div className="col-span-2">
                                    {t('video-detail:Likes')}
                                </div>
                                <div className="col-span-4">
                                    {details.likeCount}
                                </div>
                            </div>
                        </div>
                    </Block>
                    <Block>
                        <BlockTitle className="text-xl">
                            {t('details.Relevant-Videos')}
                        </BlockTitle>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                            {details.recommendedVideos.map((video) => {
                                return (
                                    <VideoResultCard
                                        data={video}
                                        key={nanoid()}
                                    />
                                )
                            })}
                        </div>
                    </Block>
                </>
            )}
            <Toolbar bottom className="bg-transparent"></Toolbar>
        </Page>
    )
}
