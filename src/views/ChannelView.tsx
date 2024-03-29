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
} from 'framework7-react'
import { useSelector } from 'react-redux'
import { selectConfig } from '@/store/globalConfig'
import { fetchChannelDetails, handleChannelContinuation } from '@/js/channel'
import { Store, useCustomContext } from '@/store/reactContext'
import { ChannelData, VideoResult } from '@/typescript/interfaces'
import { nanoid } from 'nanoid'
import { useTranslation } from 'react-i18next'
import VideoResultCard from '@/components/VideoResultCard'
import presentToast from '@/components/Toast'
import Innertube from 'youtubei.js/agnostic'
import PlaylistResultCard from '@/components/PlaylistResultCard'

export interface ChannelViewProps {
    channelId: string
}

export default function ChannelView(props: ChannelViewProps): ReactElement {
    const config = useSelector(selectConfig)
    const [channel, setChannel] = useState<ChannelData | undefined>(undefined)
    const { innertube }: { innertube: React.RefObject<Innertube | null> } =
        useCustomContext(Store)
    const { t } = useTranslation(['common'])

    // Auto fetch channel details when changing channel
    useEffect(() => {
        f7.preloader.showIn('#page-router')
        fetchChannelDetails(
            props.channelId,
            config.instance.preferType,
            innertube.current
        )
            .then((res) => {
                if (!(res instanceof Error)) {
                    setChannel(res)
                } else {
                    throw res
                }
            })
            .catch((err) => {
                presentToast('error', err)
            })
            .finally(() => {
                f7.preloader.hideIn('#page-router')
            })
    }, [props.channelId])

    const handleVideoContinuation = async () => {
        try {
            f7.preloader.show()
            if (channel?.videoContinuation !== undefined) {
                const res = await handleChannelContinuation(
                    props.channelId,
                    innertube.current,
                    channel?.videoContinuation,
                    'video'
                )
                if (res instanceof Error) {
                    throw res
                }
                res.videos = res.videos.map((video: VideoResult) => {
                    return {
                        ...video,
                        author: channel.channelInfo.name,
                        authorId: props.channelId,
                    }
                })
                setChannel((prevState) => {
                    if (prevState === undefined) {
                        return undefined
                    }
                    return {
                        ...prevState,
                        videos: [...prevState.videos, ...res.videos],
                        videoContinuation: res.videoContinuation,
                    }
                })
            }
            f7.preloader.hide()
        } catch (err) {
            presentToast('error', err as string)
            f7.preloader.hide()
        }
    }
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
                    {t('common:Channel')} {channel?.channelInfo.name}
                </NavTitle>
            </Navbar>
            <Toolbar tabbar top>
                <Link tabLink="#videos" tabLinkActive>
                    {t('common:Videos')}
                </Link>
                <Link tabLink="#playlists">{t('common:Playlists')}</Link>
            </Toolbar>
            <Tabs>
                <Tab id="videos" tabActive>
                    {channel !== undefined && channel.videos.length > 0 && (
                        <>
                            <Block className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                                {channel.videos.map((item) => (
                                    <VideoResultCard
                                        key={nanoid()}
                                        data={item}
                                    />
                                ))}
                            </Block>
                            {channel.videoContinuation !== undefined && (
                                <Block className="flex items-center justify-center mx-4">
                                    <Button
                                        raised
                                        fill
                                        className="w-1/2"
                                        onClick={handleVideoContinuation}
                                    >
                                        <Icon
                                            f7="chevron_down_circle"
                                            className="mr-2"
                                        />
                                        {t('common:Load-More')}
                                    </Button>
                                </Block>
                            )}
                        </>
                    )}
                </Tab>
                <Tab id="playlists">
                    {channel !== undefined && channel.playlists.length > 0 && (
                        <>
                            <Block className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                                {channel.playlists.map((item) => (
                                    <PlaylistResultCard
                                        key={nanoid()}
                                        data={item}
                                    />
                                ))}
                            </Block>
                            {channel.playlistContinuation !== undefined && (
                                <Block className="flex items-center justify-center mx-4">
                                    <Button raised fill className="w-1/2">
                                        <Icon
                                            f7="chevron_down_circle"
                                            className="mr-2"
                                        />
                                        {t('common:Load-More')}
                                    </Button>
                                </Block>
                            )}
                        </>
                    )}
                </Tab>
            </Tabs>
            <Toolbar bottom className="bg-transparent"></Toolbar>
        </Page>
    )
}
