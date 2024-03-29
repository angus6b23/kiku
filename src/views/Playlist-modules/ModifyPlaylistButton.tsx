import React, { useState, type ReactElement } from 'react'
import { f7, Button, Popover, List, ListItem, Icon } from 'framework7-react'
import { useTranslation } from 'react-i18next'
import { selectLocalPlaylist } from '@/store/localPlaylistReducers'
import { useDispatch, useSelector } from 'react-redux'
import presentToast from '@/components/Toast'
import { LocalPlaylist } from '@/typescript/interfaces'
import {
    changeCurrentPlaylist,
    removePlaylist,
    renamePlaylist,
} from '@/store/localPlaylistReducers'
import { FreetubePlaylist } from '@/typescript/freetube'
import ImportFreetubePopup from '@/views/Playlist-modules/ImportFreetubePopup'
import ImportYoutubePopup from '@/views/Playlist-modules/ImportYoutubePopup'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { ipcRenderer } = require('electron')

export interface ModifyPlaylistButtonProps {}

export default function ModifyPlaylistButton(): ReactElement {
    const { t } = useTranslation(['playlist'])
    const localPlaylist = useSelector(selectLocalPlaylist)
    const dispatch = useDispatch()

    const handleRemovePlaylist = () => {
        if (localPlaylist.playlists.length === 1) {
            presentToast('error', t('This-is-the-last-playlist'))
        } else {
            f7.dialog.confirm(
                t('playlist:Are-you-sure-to-remove-the-playlist'),
                () => {
                    const targetId = localPlaylist.currentPlaylistId
                    const altPlaylist = localPlaylist.playlists.find(
                        (playlist) => playlist.id !== targetId
                    ) as LocalPlaylist
                    dispatch(changeCurrentPlaylist(altPlaylist.id))
                    dispatch(removePlaylist(targetId))
                }
            )
        }
    }

    const handleRenamePlaylist = () => {
        f7.dialog.prompt(
            t('playlist:Please-input-the-new-name-for-playlist'),
            (newName) => {
                if (newName !== '') {
                    dispatch(
                        renamePlaylist({
                            id: localPlaylist.currentPlaylistId,
                            newName: newName,
                        })
                    )
                } else {
                    presentToast('error', t('playlist:Name-cannot-be-empty'))
                }
            }
        )
    }

    const handleImportFreetubePlaylist = async () => {
        const res: FreetubePlaylist[] | Error | undefined =
            (await ipcRenderer.invoke(
                'pickFreetubePlaylist'
            )) as FreetubePlaylist[]
        if (res instanceof Error) {
            presentToast('error', 'Import playlist > ' + res.message)
        } else if (res) {
            setImportFreetubePopupOpen(true)
            setImportFreetubeData(res)
        }
    }
    const handleImportYoutubePlaylist = async () => {
        const res = await ipcRenderer.invoke('pickYoutubePlaylist')
        if (res instanceof Error) {
            presentToast('error', 'Import Google Playlist > ' + res.message)
        } else if (res) {
            setImportYoutubeData(res)
            setImportYoutubePopupOpen(true)
        }
    }
    const [importFreetubePopupOpen, setImportFreetubePopupOpen] =
        useState(false)
    const [importYoutubePopupOpen, setImportYoutubePopupOpen] = useState(false)
    const [importFreetubeData, setImportFreetubeData] = useState<
        FreetubePlaylist[] | null
    >(null)
    const [importYoutubeData, setImportYoutubeData] = useState<string>('')

    const closeImportFreetubePopup = () => {
        setImportFreetubePopupOpen(false)
    }
    const closeImportYoutubePopup = () => {
        setImportYoutubePopupOpen(false)
    }
    return (
        <>
            <Button
                className="m-0"
                popoverOpen=".playlist-popover"
                tooltip={t('playlist:More-playlist-options')}
            >
                <Icon className="text-[1.5rem]" f7="ellipsis_vertical" />
            </Button>
            <Popover
                className="playlist-popover"
                backdrop={false}
                arrow={false}
            >
                <List className="cursor-pointer">
                    <ListItem
                        onClick={handleRemovePlaylist}
                        className="popover-close"
                    >
                        <div className="flex justify-start">
                            <Icon f7="minus" className="mr-4 text-[1.2rem]" />
                            <p>{t('playlist:Remove-playlist')}</p>
                        </div>
                    </ListItem>
                    <ListItem
                        onClick={handleRenamePlaylist}
                        className="popover-close"
                    >
                        <div className="flex justify-start">
                            <Icon f7="pencil" className="mr-4 text-[1.2rem]" />
                            <p>{t('playlist:Rename-playlist')}</p>
                        </div>
                    </ListItem>
                    <ListItem
                        onClick={handleImportFreetubePlaylist}
                        className="popover-close"
                    >
                        <div className="flex justify-start">
                            <Icon
                                f7="arrow_turn_right_down"
                                className="mr-4 text-[1.2rem]"
                            />
                            <p>{t('playlist:Import-Freetube-playlist')}</p>
                        </div>
                    </ListItem>
                    <ListItem
                        onClick={handleImportYoutubePlaylist}
                        className="popover-close"
                    >
                        <div className="flex justify-start">
                            <Icon
                                f7="arrow_turn_right_down"
                                className="mr-4 text-[1.2rem]"
                            />
                            <p>{t('playlist:Import-Google-playlist')}</p>
                        </div>
                    </ListItem>
                </List>
            </Popover>
            <ImportFreetubePopup
                opened={importFreetubePopupOpen}
                data={importFreetubeData}
                closeModal={closeImportFreetubePopup}
            />
            <ImportYoutubePopup
                opened={importYoutubePopupOpen}
                data={importYoutubeData}
                closeModal={closeImportYoutubePopup}
            />
        </>
    )
}
