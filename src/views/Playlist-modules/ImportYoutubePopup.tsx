import {
    f7,
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
    useRef,
    SyntheticEvent,
    BaseSyntheticEvent,
} from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import {
    newLocalPlaylist,
    setPlaylistItem,
} from '@/store/localPlaylistReducers'
import { getPlayitem } from '@/js/fetchInfo'
import { selectConfig } from '@/store/globalConfig'
import { Store, useCustomContext } from '@/store/reactContext'
import { Playitem } from '@/typescript/interfaces'
import presentToast from '@/components/Toast'
import { AnyAction } from '@reduxjs/toolkit'

export interface ImportPopupProps {
    data: string[] | null
    opened: boolean
    closeModal: () => void
}

export default function ImportYoutubePopup(
    props: ImportPopupProps
): ReactElement {
    const { t } = useTranslation(['playlist', 'common'])
    const config = useSelector(selectConfig)
    const { innertube } = useCustomContext(Store)
    const dispatch = useDispatch()
    const [ytPlaylist, setYtPlaylist] = useState<Playitem[]>([])
    const [playlistName, setPlaylistName] = useState<string>('')
    const pageRef = useRef<HTMLElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const handleChangePlaylistName = (e: BaseSyntheticEvent) => {
        setPlaylistName(e.target.value)
    }

    useEffect(() => {
        if (props.data) {
            f7.preloader.showIn(pageRef.current as HTMLElement)
            const newPlaylist = props.data as string[]
            // console.log(newPlaylist)
            const itemPromises = newPlaylist.map((id) =>
                getPlayitem(id, config.instance.preferType, innertube.current)
            )
            Promise.all(itemPromises)
                .then((newItems) => {
                    const playItems = newItems.filter(
                        (item) => !(item instanceof Error)
                    ) as Playitem[]
                    // console.log(playItems)
                    if (playItems.length !== newItems.length) {
                        presentToast(
                            'info',
                            t('playlist:items-cannot-be-retrieved', {
                                count: newItems.length - playItems.length,
                            })
                        )
                    }
                    setYtPlaylist(playItems)
                    inputRef.current?.focus()
                })
                .finally(() => {
                    f7.preloader.hideIn(pageRef.current as HTMLElement)
                })
        }
    }, [props.data])

    const handleImport = async () => {
        if (playlistName) {
            const newPlaylistId = await dispatch(
                newLocalPlaylist(playlistName) as unknown as AnyAction
            )
            dispatch(
                setPlaylistItem({
                    id: newPlaylistId.payload as string,
                    items: ytPlaylist,
                })
            )
            presentToast(
                'success',
                t('playlist:Playlist-successfully-imported')
            )
            props.closeModal()
        } else {
            presentToast('error', t('playlist:Please-input-playlist-name'))
        }
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
                        <section ref={pageRef} className="overflow-hidden">
                            <List className="my-0">
                                {ytPlaylist.map((item) => (
                                    <ListItem
                                        key={item.id}
                                        title={item.title}
                                        after={item.duration}
                                        media={item.thumbnailURL}
                                    />
                                ))}
                            </List>
                        </section>
                    </Block>
                    <Block className="sticky bottom-0 w-full flex gap-4 justify-around pb-4 pt-2 px-4 bg-[--f7-md-surface]">
                        <div>
                            <input
                                type="text"
                                ref={inputRef}
                                placeholder={t('playlist:Playlist-Name')}
                                className="h-full"
                                value={playlistName}
                                onChange={handleChangePlaylistName}
                            />
                        </div>
                        <div className="flex">
                            <Button onClick={props.closeModal}>
                                {t('common:Cancel')}
                            </Button>
                            <Button fill onClick={handleImport}>
                                {t('playlist:Import-Selected')}
                            </Button>
                        </div>
                    </Block>
                </Page>
            </Popup>
        </>
    )
}
