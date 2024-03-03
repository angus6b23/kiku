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
import React, { type ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { nanoid } from 'nanoid'

export interface ImportPopupProps {
    // type: 'freetube' | 'youtube'
    data: FreetubePlaylist[] | null
    opened: boolean
    closeModal: () => void
}

export default function ImportPopup(props: ImportPopupProps): ReactElement {
    const { t } = useTranslation(['playlist', 'common'])
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
                            {props.data &&
                                props.data.map((playlist) => {
                                    return (
                                        <ListItem
                                            checkbox
                                            defaultChecked
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
                        <Button onClick={props.closeModal}>{t('common:Cancel')}</Button> 
                        <Button fill>{t('playlist:Import-Selected')}</Button> 
                    </section>
                </Page>
            </Popup>
        </>
    )
}
