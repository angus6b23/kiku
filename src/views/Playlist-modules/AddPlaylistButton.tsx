import React, { type ReactElement } from 'react'
import { f7, Button, Icon } from 'framework7-react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { newPlaylist } from '@/store/localPlaylistReducers'
import presentToast from '@/components/Toast'

export interface AddPlaylistButtonProps {}

export default function AddPlaylistButton(): ReactElement {
    const { t } = useTranslation()
    const dispatch = useDispatch()
    const handleNewPlaylist = () => {
        f7.dialog.prompt(
            t('playlist:Please-input-name-of-the-new-playlist'),
            (name) => {
                if (name){
                    dispatch(newPlaylist(name))
                    presentToast('success', t('playlist:Playlist-Added'))
                } else {
                    presentToast('error', t('playlist:Playlist-name-cannot-be-empty'))
                }
            }
        )
    }
    return (
        <>
            <Button
                className="m-0"
                tooltip={t('playlist:New-Playlist')}
                onClick={handleNewPlaylist}
            >
                <Icon className="text-[1.5rem]" f7="plus" />
            </Button>
        </>
    )
}
