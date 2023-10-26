import React, { type ReactElement } from 'react'
import { Store, useCustomContext } from '../components/context'
import { Button, Icon, List, ListItem } from 'framework7-react'
import { PlayerAction, PlayerState, Playitem, PlaylistAction } from '../components/interfaces'
import {useAudio} from '../components/reducers'

export interface PlayListProps {}

export default function PlayList(props: PlayListProps): ReactElement {
    const {
        playlist,
        dispatchPlaylist,
        playerState,
        dispatchPlayer,
        audio,
        audioSource
    }: {
        playlist: Playitem[],
        dispatchPlaylist: React.Dispatch<PlaylistAction>,
        playerState: PlayerState,
        dispatchPlayer: React.Dispatch<PlayerAction>,
        audio: React.Ref<HTMLAudioElement>
        audioSource: React.Ref<HTMLSourceElement>
    } = useCustomContext(Store)
    const generateItemClass = (item: Playitem) => {
        if (item.downloadStatus === 'pending') {
            return 'opacity-60 cursor-default'
        } else if (item.downloadStatus === 'downloading') {
            return 'animate-pulse cursor-default'
        }
        return 'cursor-pointer'
    }
    const handleSelectSong = (item: Playitem) => {
        if(item.downloadStatus === 'downloaded' && audio.current.src != item.audioBlob){
            useAudio(audio.current, audioSource.current, {type: "SELECT_SONG", payload: item});
            dispatchPlaylist({type: "SET_PLAYING", payload: item})
        }
    }
    return (
        <>
            <List sortable sortableEnabled strong>
                {playlist.map((item) => (
                    <ListItem key={item.id} className={generateItemClass(item)} onClick={()=>handleSelectSong(item)}>
                        <div className="grid grid-cols-3">
                            <div className="col-span-1 p-2 flex items-center justify-center">
                                <img
                                    className="object-cover"
                                    src={item.thumbnailURL}
                                />
                            </div>
                            <div className="col-span-2 flex flex-wrap justify-start items-stretch p-2 gap-2">
                                <div className="w-full flex justify-between items-start">
                                    <p className="lg:text-md text-sm font-semibold">
                                        {item.title}
                                    </p>
                                    <p>{item.duration}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        className="w-8 h-8 flex justify-center items-center"
                                        tooltip="Download to disk"
                                    >
                                        <Icon
                                            className="text-lg -translate-y-1"
                                            f7="floppy_disk"
                                        />
                                    </Button>
                                    <Button
                                        className="w-8 h-8 flex justify-center items-center"
                                        tooltip="Remove from playlist"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            dispatchPlaylist({
                                                type: 'REMOVE',
                                                payload: item.id
                                            })
                                        }}
                                    >
                                        <Icon
                                            className="text-lg -translate-y-1"
                                            f7="xmark"
                                        />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </ListItem>
                ))}
            </List>
        </>
    )
}
