import React, { useRef, type ReactElement, useState } from 'react'
import { Block, List, ListItem, Navbar } from 'framework7-react'
import { Playitem } from '@/typescript/interfaces'
import { useSelector, useDispatch } from 'react-redux'
import { selectPlaylist, setItemPlaying, sort } from '@/store/playlistReducers'
import { play, selectPlayer } from '@/store/playerReducers'
import PlayItemInner from '@/components/PlayItemInner'
import PlaylistControlBar from '@/views/Playlist-modules/PlaylistControlBar'
import { useTranslation } from 'react-i18next'

export interface PlayListProps {}

interface sortEvent {
    from: number
    to: number
}
export default function PlayList(): ReactElement {
    const playerState = useSelector(selectPlayer)
    const playlist = useSelector(selectPlaylist)
    const dispatch = useDispatch()
    const playingRef = useRef<HTMLElement>(null)
    const { t } = useTranslation(['common', 'playlist'])
    const [sortEnabled, setSortEnabled] = useState(false)

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

    const toggleSort = () => {
        setSortEnabled((prevState) => !prevState)
    }

    const scrollToPlaying = () => {
        if (playingRef.current !== null) {
            playingRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            })
        }
    }
    // Disabled due to strange behaviour
    // useEffect(() => {
    //     if (playingRef.current != null && config.ui.autoScroll){
    //         playingRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    //     }
    // }, [playerState.currentPlaying])
    return (
        <>
            <Navbar title={t('common:Playlist')} />
            {/* Control bar */}
            <Block className="sticky top-0 z-10 m-0 bg-[--f7-md-surface-1]">
                <PlaylistControlBar
                    sortEnabled={sortEnabled}
                    toggleSort={toggleSort}
                    scrollToPlaying={scrollToPlaying}
                />
            </Block>
            {/* Playlist Starts here */}
            <List
                sortable
                sortableEnabled={sortEnabled}
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
                        {item.status === 'playing' && <span ref={playingRef} />}
                        <PlayItemInner item={item} />
                    </ListItem>
                ))}
            </List>
        </>
    )
}
