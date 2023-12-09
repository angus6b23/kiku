import React, { useEffect, type ReactElement, useState } from 'react'
import {
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
import { Store, useCustomContext } from '@/components/context'
import Innertube from 'youtubei.js/agnostic'
import { PlaylistData } from '@/components/interfaces'
import { nanoid } from 'nanoid'
import VideoResultCard from '@/components/VideoResultCard'
import { selectSearch } from '@/store/searchReducers'
import presentToast from '@/components/Toast'
import { handleGetPlaylist } from '@/js/playlist'
import { useTranslation } from 'react-i18next'

export interface PlaylistViewProps {
    playlistId: string
}

export default function PlaylistView(props: PlaylistViewProps): ReactElement {
    const config = useSelector(selectConfig)
    const search = useSelector(selectSearch)
    const [playlist, setPlaylist] = useState<PlaylistData | undefined>(
        undefined
    )
    const { innertube }: { innertube: React.RefObject<Innertube | null> } =
        useCustomContext(Store)
    const { t } = useTranslation(['common'])

    // Auto fetch channel details when changing channel
    useEffect(() => {
        f7.preloader.showIn('#page-router')
        handleGetPlaylist(
            props.playlistId,
            config.instance.preferType,
            innertube.current
        )
            .then((res) => {
                if (!(res instanceof Error)) {
                    f7.preloader.hideIn('#page-router')
                    setPlaylist(res)
                } else {
                    throw res
                }
            })
            .catch((err) => {
                f7.preloader.hideIn('#page-router')
                presentToast('error', err)
            })
    }, [props.playlistId])

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
                    {t('common:Playlist')} {playlist?.playlistInfo.title}
                </NavTitle>
            </Navbar>
            {playlist !== undefined && playlist.videos.length > 0 && (
                <Block className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {playlist.videos.map((item) => (
                        <VideoResultCard key={nanoid()} data={item} />
                    ))}
                </Block>
            )}
            <Toolbar bottom className="bg-transparent"></Toolbar>
        </Page>
    )
}
