import React, { BaseSyntheticEvent, type ReactElement } from 'react'
import { Button, Icon, List, ListItem } from 'framework7-react'
import { useDispatch, useSelector } from 'react-redux'
import { setSong, stop } from '@/store/playerReducers'
import { useTranslation } from 'react-i18next'
import { selectLocalPlaylist } from '@/store/localPlaylistReducers'
import { LocalPlaylist } from '@/typescript/interfaces'
import { changeCurrentPlaylist } from '@/store/localPlaylistReducers'
import RemoveButton from './RemoveButton'
import RandomButton from './RandomButton'
import ModifyPlaylistButton from './ModifyPlaylistButton'
import AddPlaylistButton from './AddPlaylistButton'
import SearchButton from './SearchButton'

export interface PlaylistControlBarProps {
    sortEnabled: boolean
    toggleSort: () => void
}

export default function PlaylistControlBar(
    props: PlaylistControlBarProps
): ReactElement {
    const dispatch = useDispatch()
    const localPlaylist = useSelector(selectLocalPlaylist)
    const { t } = useTranslation(['playlist'])

    const getCurrentPlaylistName = () => {
        const currentPlaylist = localPlaylist.playlists.find(
            (item) => item.id === localPlaylist.currentPlaylistId
        ) as LocalPlaylist
        return currentPlaylist.name
    }
    const handlePlaylistChange = (e: BaseSyntheticEvent) => {
        dispatch(setSong(undefined))
        dispatch(stop())
        dispatch(changeCurrentPlaylist(e.target.value))
    }
    return (
        <>
            <div className="grid grid-cols-4">
                <List className="col-span-3 m-0">
                    <ListItem
                        smartSelect
                        smartSelectParams={{
                            openIn: 'popover',
                            closeOnSelect: true,
                        }}
                        title={getCurrentPlaylistName()}
                        className="playlist-select">
                        <select
                            name="local-playlist"
                            defaultValue={localPlaylist.currentPlaylistId}
                            onChange={handlePlaylistChange}>
                            {localPlaylist.playlists.map((playlist) => (
                                <option value={playlist.id} key={playlist.id}>
                                    {playlist.name}
                                </option>
                            ))}
                        </select>
                    </ListItem>
                </List>
                <div className="col-span-1 flex mt-1">
                    <AddPlaylistButton />
                    <ModifyPlaylistButton />
                </div>
            </div>
            <div className="flex h-full justify-around items-center py-2 m-0 flex-wrap gap-2">
                <RandomButton />
                <RemoveButton />
                {/* Button for toggling reorder */}
                <Button
                    fill={props.sortEnabled}
                    tooltip={t('playlist:Reorder-items')}
                    className="m-0"
                    onClick={props.toggleSort}>
                    <Icon
                        f7="arrow_up_arrow_down"
                        className="text-[1.2rem]"></Icon>
                </Button>
                {/* Button for scroll to current playing item */}
                <SearchButton />
            </div>
        </>
    )
}
