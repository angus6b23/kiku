import React, { BaseSyntheticEvent, type ReactElement } from 'react'
import { Button, Icon, List, ListItem, Popover, f7 } from 'framework7-react'
import { useDispatch, useSelector } from 'react-redux'
import {
    clearErrorItems,
    clearPlayedItems,
    clearAllItems,
    shuffleUnplayed,
} from '@/store/playlistReducers'
import { setSong, stop } from '@/store/playerReducers'
import { useTranslation } from 'react-i18next'
import {newPlaylist, removePlaylist, renamePlaylist, selectLocalPlaylist} from '@/store/localPlaylistReducers'
import {LocalPlaylist} from '@/typescript/interfaces'
import { changeCurrentPlaylist } from '@/store/localPlaylistReducers'
import presentToast from './Toast'

export interface PlaylistControlBarProps {}

export default function PlaylistControlBar(): ReactElement {
    const dispatch = useDispatch()
    const localPlaylist = useSelector(selectLocalPlaylist)
    const { t } = useTranslation(['playlist'])

    const handleClearPlaylist = () => {
        f7.dialog.confirm(
            t('playlist:Are-you-sure-to-clear-the-playlist'),
            t('playlist:Clear-playlist'),
            () => {
                dispatch(clearAllItems())
                dispatch(setSong(undefined))
                dispatch(stop())
            }
        )
    }
    const getCurrentPlaylistName = () => {
        const currentPlaylist = localPlaylist.playlists.find(item => item.id === localPlaylist.currentPlaylistId) as LocalPlaylist
        return currentPlaylist.name
    }
    const handlePlaylistChange = (e: BaseSyntheticEvent) => {
        dispatch(setSong(undefined))
        dispatch(stop())
        dispatch(changeCurrentPlaylist(e.target.value))
    }
    const handleNewPlaylist = () => {
        f7.dialog.prompt(t('playlist:Please-input-name-of-the-new-playlist'), (name) => {
            dispatch(newPlaylist(name))
            presentToast('success', t('playlist:Playlist-Added'))
        })
    }
    const handleRemovePlaylist = () => {
        if (localPlaylist.playlists.length === 1) {
            presentToast('error', t('This-is-the-last-playlist'))
        } else {
            f7.dialog.confirm(t('playlist:Are-you-sure-to-remove-the-playlist?'), () => {
                const targetId = localPlaylist.currentPlaylistId
                const altPlaylist = localPlaylist.playlists.find(playlist => playlist.id !== targetId) as LocalPlaylist
                dispatch(changeCurrentPlaylist(altPlaylist.id))
                dispatch(removePlaylist(targetId))
            })
        }
    }
    const handleRenamePlaylist = () => {
        f7.dialog.prompt(t('playlist:Please-input-the-new-name-for-playlist'), (newName) => {
            if (newName !== ""){
                dispatch(renamePlaylist({id: localPlaylist.currentPlaylistId, newName: newName}))
            } else {
                presentToast('error', t('playlist:Name-cannot-be-empty'))
            }
        })
    }
    return (
        <>
            <div className="grid grid-cols-4">
                <List className="col-span-3 m-0">
                    <ListItem smartSelect smartSelectParams={{openIn: "popover", closeOnSelect: true}} title={getCurrentPlaylistName()} className="playlist-select">
                        <select name="local-playlist" defaultValue={localPlaylist.currentPlaylistId} onChange={handlePlaylistChange}>
                            {localPlaylist.playlists.map(playlist => <option value={playlist.id} key={playlist.id}>{playlist.name}</option>)}
                        </select>
                    </ListItem>
                </List>
                <div className="col-span-1 flex mt-1">
                    <Button className='m-0' tooltip={t('playlist:New-Playlist')} onClick={handleNewPlaylist}>
                        <Icon className="text-[1.5rem]" f7="plus" />
                    </Button>
                    <Button className='m-0' popoverOpen=".playlist-popover">
                        <Icon className="text-[1.5rem]" f7="ellipsis_vertical" />
                    </Button>
                </div>
            </div>
            <div className="flex h-full justify-around items-center py-2 m-0 flex-wrap gap-2">
                <Button
                    className="m-0"
                    tooltip={t('playlist:Clear-Error-items')}
                    onClick={() => dispatch(clearErrorItems())}
                >
                    <Icon className="text-[1.5rem]" f7="flag_slash_fill"></Icon>
                </Button>
                <Button
                    className="m-0"
                    tooltip={t('playlist:Clear-played-items')}
                    onClick={() => dispatch(clearPlayedItems())}
                >
                    <Icon className="text-[1.5rem]" f7="flowchart_fill"></Icon>
                </Button>
                <Button
                    className="m-0"
                    tooltip={t('playlist:Shuffle-unplayed-items')}
                    onClick={() => dispatch(shuffleUnplayed())}
                >
                    <Icon className="text-[1.5rem]" f7="shuffle"></Icon>
                </Button>
                <Button
                    className="m-0"
                    tooltip={t('playlist:Clear-playlist')}
                    onClick={handleClearPlaylist}
                >
                    <Icon className="text-[1.5rem]" f7="trash"></Icon>
                </Button>
            </div>
            <Popover className="playlist-popover" backdrop={false} arrow={false}>
                <List className="cursor-pointer">
                    <ListItem onClick={handleRemovePlaylist} popoverClose>
                        <Icon f7="minus" />
                        <p>{t('playlist:Remove-playlist')}</p>
                    </ListItem>
                    <ListItem onClick={handleRenamePlaylist} popoverClose>
                        <Icon f7="pencil" />
                        <p>{t('playlist:Rename-playlist')}</p>
                    </ListItem>
                </List>
            </Popover>
        </>
    )
}
