import React, { useRef, type ReactElement, useEffect } from 'react'
import { Block, List, ListItem } from 'framework7-react'
import { Playitem } from '../components/interfaces'
import { useSelector, useDispatch } from 'react-redux'
import { selectPlaylist, setItemPlaying, sort } from '@/store/playlist'
import { play, selectPlayer } from '@/store/player'
import PlayItemInner from '@/components/PlayItemInner'
import PlaylistControlBar from '@/components/PlaylistControlBar'
import {selectConfig} from '@/store/globalConfig'

export interface PlayListProps {}

interface sortEvent {
    from: number
    to: number
}
export default function PlayList(): ReactElement {
    const playerState = useSelector(selectPlayer)
    const playlist = useSelector(selectPlaylist)
    const dispatch = useDispatch();
    const config = useSelector(selectConfig);
    const playingRef = useRef<HTMLElement>(null)


    const generateItemClass = (item: Playitem) => {
        if (item.downloadStatus === 'pending') {
            return 'opacity-60 cursor-default'
        } else if (item.downloadStatus === 'downloading') {
            return 'animate-pulse cursor-default'
        }
        return 'cursor-pointer'
    }

    const handleSelectSong = (item: Playitem) => {
        if (
            item.downloadStatus === 'downloaded' &&
            playerState.currentPlaying?.id != item.id
        ) {
            dispatch(setItemPlaying(item.id))
        } else if (playerState.status != 'playing') {
            dispatch(play())
        }
    }
    const handleSortMove = (e: sortEvent) => {
        dispatch(sort({ from: e.from, to: e.to }))
    }
    // Disabled due to strange behaviour
    // useEffect(() => {
    //     if (playingRef.current != null && config.ui.autoScroll){
    //         playingRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    //     }
    // }, [playerState.currentPlaying])
    return (
        <>
            {/* Control bar */}
            <Block className="sticky top-0 z-10 m-0 bg-[--f7-md-surface-1]">
                <PlaylistControlBar />
            </Block>
            {/* Playlist Starts here */}
            <List
                sortable
                sortableEnabled
                outline
                dividers
                strong
                className="mt-2"
                onSortableSort={handleSortMove}
            >
                {playlist.map((item) => (
                    <ListItem
                        key={item.id}
                        className={generateItemClass(item)}
                        onClick={() => handleSelectSong(item)}
                        badge={item.downloadStatus === 'error' ? '!' : ''}
                        badgeColor="red"
                    >
                        {item.status === 'playing' && <span ref={playingRef}/>}
                        <PlayItemInner item={item} />
                    </ListItem>
                ))}
            </List>
        </>
    )
}
