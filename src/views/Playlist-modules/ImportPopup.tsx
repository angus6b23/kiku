import { FreetubePlaylist } from '@/typescript/freetube'
import {
    AccordionContent,
    Block,
    Button,
    Icon,
    Link,
    List,
    ListItem,
    NavRight,
    Navbar,
    Page,
    Popup,
} from 'framework7-react'
import React, {
    useState,
    type ReactElement,
    useEffect,
} from 'react'
import { useTranslation } from 'react-i18next'
import { nanoid } from 'nanoid'
import { useDispatch, useSelector } from 'react-redux'
import { newLocalPlaylist, newPlaylist, selectLocalPlaylist, setPlaylistItem } from '@/store/localPlaylistReducers'
import { getPlayitem } from '@/js/fetchInfo'
import { selectConfig } from '@/store/globalConfig'
import { Store, useCustomContext } from '@/store/reactContext'
import {selectPlaylist} from '@/store/playlistReducers'
import {Playitem} from '@/typescript/interfaces'
import {AnyAction} from '@reduxjs/toolkit'

export interface ImportPopupProps {
    // type: 'freetube' | 'youtube'
    data: FreetubePlaylist[] | null
    opened: boolean
    closeModal: () => void
}

export default function ImportPopup(props: ImportPopupProps): ReactElement {
    const { t } = useTranslation(['playlist', 'common'])
    const config = useSelector(selectConfig)
    const localPlaylist = useSelector(selectLocalPlaylist)
    const { innertube } = useCustomContext(Store)
    const dispatch = useDispatch()
    const [importPlaylist, setImportPlaylist] = useState(props.data)

    useEffect(() => {
        const newPlaylists = props.data as FreetubePlaylist[]
        if (newPlaylists) {
            setImportPlaylist(
                newPlaylists.map((playlist) => {
                    return {
                        ...playlist,
                        checked: true,
                    }
                })
            )
        }
    }, [props.data])

    const togglePlaylist = (name: string) => {
        const currPlaylist = importPlaylist as FreetubePlaylist[]
        setImportPlaylist(
            currPlaylist.map((playlist) => {
                if (playlist.playlistName === name) {
                    return {
                        ...playlist,
                        checked: !playlist.checked,
                    }
                } else {
                    return playlist
                }
            })
        )
    }
    const handleImport = async () => {
        const selectedPlaylist = importPlaylist?.filter(
            (ftPlaylist) => ftPlaylist.checked
        ) as FreetubePlaylist[]
        for (const ftPlaylist of selectedPlaylist) {
            const newPlaylistId = await dispatch(newLocalPlaylist(ftPlaylist.playlistName) as unknown as AnyAction)
            const playItemsPromise = ftPlaylist.videos.map((video) =>
                getPlayitem(
                    video.videoId,
                    config.instance.preferType,
                    innertube.current
                )
            )
            let playItems = await Promise.all(playItemsPromise)
            playItems = playItems.filter(item => !(item instanceof Error))
            dispatch(setPlaylistItem({id: newPlaylistId.payload, items: playItems as Playitem[]}))
        }
        props.closeModal()
    }

    return (
        <>
            <Popup opened={props.opened} onPopupClose={props.closeModal}>
                <Page>
                    <Navbar title={t('playlist:Import-Playlist')}>
                        <NavRight>
                            <Link onClick={props.closeModal}>
                                <Icon f7="xmark" />
                            </Link>
                        </NavRight>
                    </Navbar>
                    <Block>
                        <List strong>
                            {importPlaylist &&
                                importPlaylist.map((playlist) => {
                                    return (
                                        <ListItem
                                            checkbox
                                            checked={playlist.checked}
                                            onChange={() =>
                                                togglePlaylist(
                                                    playlist.playlistName
                                                )
                                            }
                                            title={playlist.playlistName}
                                            after={`${
                                                playlist.videos.length
                                            } ${t('common:videos')}`}
                                            key={nanoid()}
                                        >
                                            <div slot="footer">
                                                <ListItem
                                                    accordionItem
                                                    title={t(
                                                        'playlist:Show-videos'
                                                    )}
                                                    className="-ml-4"
                                                >
                                                    <AccordionContent>
                                                        <Block>
                                                            {playlist.videos.map(
                                                                (video) => {
                                                                    return (
                                                                        <ListItem
                                                                            key={
                                                                                video.videoId
                                                                            }
                                                                        >
                                                                            {
                                                                                video.title
                                                                            }
                                                                        </ListItem>
                                                                    )
                                                                }
                                                            )}
                                                        </Block>
                                                    </AccordionContent>
                                                </ListItem>
                                            </div>
                                        </ListItem>
                                    )
                                })}
                        </List>
                    </Block>
                    <section className="absolute bottom-4 w-full flex gap-4 justify-end py-2 px-4">
                        <Button onClick={props.closeModal}>
                            {t('common:Cancel')}
                        </Button>
                        <Button fill onClick={handleImport}>
                            {t('playlist:Import-Selected')}
                        </Button>
                    </section>
                </Page>
            </Popup>
        </>
    )
}
