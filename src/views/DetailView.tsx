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
    Toolbar,
    BlockTitle,
    Popover,
    f7,
    ListItem,
    List,
} from 'framework7-react'
import { useDispatch, useSelector } from 'react-redux'
import { selectConfig } from '@/store/globalConfig'
import { Store, useCustomContext } from '@/store/reactContext'
import { VideoDetails } from '@/typescript/interfaces'
import { nanoid } from 'nanoid'
import VideoResultCard from '@/components/VideoResultCard'
import presentToast from '@/components/Toast'
import { useTranslation } from 'react-i18next'
import { getVideoDetail } from '@/js/videoDetail'
import { convertSecond } from '@/utils/format'
import { addToNextSong, selectPlaylist } from '@/store/playlistReducers'
import { Playitem } from '@/typescript/interfaces'
import { addToPlaylist } from '@/store/playlistReducers'
import Innertube from 'youtubei.js/agnostic'
import { longNumber } from '@/utils/format'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { shell } = require('electron')
export interface DetailViewProps {
    videoId: string
}

export default function DetailView(props: DetailViewProps): ReactElement {
    const config = useSelector(selectConfig)
    const playlist = useSelector(selectPlaylist)
    const { innertube }: { innertube: React.RefObject<Innertube | null> } =
        useCustomContext(Store)
    const { t } = useTranslation(['search-result', 'video-detail'])
    const dispatch = useDispatch()

    const [details, setDetails] = useState<VideoDetails | undefined>(undefined) // Local state for storing page data of video details

    const highResImage = details?.videoThumbnails.find(
        // For extracting max res thumbnail from video details
        (thumbnail) => thumbnail.quality === 'maxres' || 'maxresdefault'
    )

    const getIntlDate = (timestamp: number) => {
        // Helper function for translating published timestamp to readable local time
        const date = new Date(timestamp * 1000)
        const intlTime = new Intl.DateTimeFormat(config.ui.lang, {
            dateStyle: 'full',
        }).format(date)
        return intlTime
    }
    const handleAddToPlaylist = (nextSong: boolean = false) => {
        // Helper function for adding song to playlist
        const sameId = playlist.filter(
            (item: Playitem) => item.id === props.videoId
        )
        if (sameId.length > 0) return
        const newPlayitem: Playitem = {
            id: props.videoId,
            title: details?.title as string,
            thumbnailURL: highResImage === undefined ? '' : highResImage.url,
            duration: convertSecond(details?.lengthSeconds as number),
            status: 'added',
            downloadStatus: 'pending',
        }
        if (nextSong) {
            dispatch(addToNextSong(newPlayitem))
        } else {
            dispatch(addToPlaylist(newPlayitem))
        }
    }
    const copyLink = (type: string) => {
        const invidiousUrl = config.instance.preferType.find(
            (item) => item.type === 'invidious'
        )?.url
        switch (type) {
            case 'youtube':
                navigator.clipboard.writeText(
                    `https://youtu.be/${details?.videoId}`
                )
                break
            case 'invidious':
                navigator.clipboard.writeText(
                    invidiousUrl + `/watch?v=${details?.videoId}`
                )
                break
            default:
        }
        presentToast('success', t('video-detail:Copied-Link'))
    }
    const openLink = (type: string) => {
        const invidiousUrl = config.instance.preferType.find(
            (item) => item.type === 'invidious'
        )?.url
        switch (type) {
            case 'youtube':
                shell.openExternal(`https://youtu.be/${details?.videoId}`)
                break
            case 'invidious':
                shell.openExternal(
                    invidiousUrl + `/watch?v=${details?.videoId}`
                )
                break
            default:
        }
    }
    // Auto fetch channel details when changing channel
    useEffect(() => {
        f7.preloader.showIn('#page-router')
        getVideoDetail(
            props.videoId,
            config.instance.preferType,
            innertube.current
        )
            .then((res) => {
                if (res instanceof Error) {
                    presentToast('error', res.message)
                    setDetails(undefined)
                } else {
                    setDetails(res)
                }
            })
            .catch((err) => {
                presentToast('error', err)
            })
            .finally(() => {
                f7.preloader.hideIn('#page-router')
            })
    }, [props.videoId])

    return (
        <Page>
            {/* Navbar here */}
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
            {/* Content when details not undefined */}
            {details !== undefined && (
                <>
                    <Block className="grid grid-cols-6">
                        <div className="col-span-3 p-6 flex items-center justify-center object-contain">
                            <img src={highResImage?.url}></img>
                        </div>
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
                                {!isNaN(details.published) && (
                                    <>
                                        <div className="col-span-2">
                                            {t('video-detail:Published-at')}
                                        </div>
                                        <div className="col-span-4">
                                            {getIntlDate(details.published)}
                                        </div>
                                    </>
                                )}
                                {details.viewCount && (
                                    <>
                                        <div className="col-span-2">
                                            {t('video-detail:Views')}
                                        </div>
                                        <div className="col-span-4">
                                            {longNumber(details.viewCount)}
                                        </div>
                                    </>
                                )}
                                <div className="col-span-2">
                                    {t('video-detail:Likes')}
                                </div>
                                <div className="col-span-4">
                                    {longNumber(details.likeCount)}
                                </div>
                            </div>
                            {/* Buttons */}
                            <section className="flex flex-wrap gap-2">
                                <div className="flex gap-8 w-full">
                                    <Button
                                        fill
                                        onClick={() =>
                                            handleAddToPlaylist(false)
                                        }
                                    >
                                        <Icon
                                            f7="plus_rectangle_fill"
                                            className="mr-2 text-[1.2rem]"
                                        />
                                        {t('search-result:Add-to-playlist')}
                                    </Button>
                                    <Button
                                        fill
                                        onClick={() =>
                                            handleAddToPlaylist(true)
                                        }
                                    >
                                        <Icon
                                            f7="arrow_right_to_line"
                                            className="mr-2 text-[1.2rem]"
                                        />
                                        {t('search-result:Add-to-next-song')}
                                    </Button>
                                </div>
                                <div className="flex gap-8 w-full">
                                    <Button fill popoverOpen=".copy-popover">
                                        <Icon
                                            f7="doc_on_clipboard_fill"
                                            className="mr-2 text-[1.2rem]"
                                        />
                                        {t('search-result:Copy-Link')}
                                    </Button>
                                    <Button
                                        fill
                                        popoverOpen=".open-link-popover"
                                    >
                                        <Icon
                                            f7="link"
                                            className="mr-2 text-[1.2rem]"
                                        />
                                        {t('search-result:Open-link')}
                                    </Button>
                                </div>
                            </section>
                        </div>
                        {/* Video Description */}
                        <h3 className="text-xl col-span-6 mb-2">
                            {t('video-detail:Description')}
                        </h3>
                        <p className="col-span-6 whitespace-pre-line">
                            {details.description}
                        </p>
                    </Block>
                    {/* Recommend Videos */}
                    <Block>
                        <BlockTitle className="text-xl">
                            {t('video-detail:Relevant-Videos')}
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
                    <Popover
                        className="copy-popover"
                        backdrop={false}
                        arrow={false}
                    >
                        <List>
                            <ListItem
                                className="popover-close flex justify-start"
                                onClick={() => copyLink('youtube')}
                                link="#"
                                noChevron={true}
                            >
                                <div className="flex justify-start">
                                    <Icon
                                        f7="square_arrow_up_fill"
                                        className="mr-2 text-[1.2rem]"
                                    />
                                    <p>Youtube</p>
                                </div>
                            </ListItem>
                            <ListItem
                                className="popover-close"
                                onClick={() => copyLink('invidious')}
                                link="#"
                                noChevron={true}
                            >
                                <div className="flex justify-start">
                                    <Icon
                                        f7="smiley_fill"
                                        className="mr-2 text-[1.2rem]"
                                    />
                                    <p>Invidious</p>
                                </div>
                            </ListItem>
                        </List>
                    </Popover>
                    <Popover
                        className="open-link-popover"
                        backdrop={false}
                        arrow={false}
                    >
                        <List>
                            <ListItem
                                className="popover-close"
                                onClick={() => openLink('youtube')}
                                link="#"
                                noChevron={true}
                            >
                                <div className="flex justify-start">
                                    <Icon
                                        f7="square_arrow_up_fill"
                                        className="mr-2 text-[1.2rem]"
                                    />
                                    <p>Youtube</p>
                                </div>
                            </ListItem>
                            <ListItem
                                className="popover-close"
                                onClick={() => openLink('invidious')}
                                link="#"
                                noChevron={true}
                            >
                                <div className="flex justify-start">
                                    <Icon
                                        f7="smiley_fill"
                                        className="mr-2 text-[1.2rem]"
                                    />
                                    <p>Invidious</p>
                                </div>
                            </ListItem>
                        </List>
                    </Popover>
                </>
            )}
            {/* Toolbar placeholder */}
            <Toolbar bottom className="bg-transparent"></Toolbar>
        </Page>
    )
}
