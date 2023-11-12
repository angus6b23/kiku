import React, { type ReactElement } from 'react'
import { Playitem } from './interfaces'
import { Button, Icon } from 'framework7-react'
import { useDispatch, useSelector } from 'react-redux'
import { removeFromPlaylist, selectPlaylist, setItemPlaying, setItemRetry } from '@/store/playlist'
import { Store, useCustomContext } from './context'
import {getNextSong} from '@/utils/songControl'
import {setSong, stop} from '@/store/player'

export interface PlayItemInnerProps {
    item: Playitem
}

export default function PlayItemInner(props: PlayItemInnerProps): ReactElement {
    const { item } = props
    const dispatch = useDispatch()
    const playlist = useSelector(selectPlaylist)
    const { dispatchAudioBlob } = useCustomContext(Store)

    const handleItemRemoval = (item: Playitem) => {
        if(item.status === 'playing'){
            const nextSong = getNextSong(playlist)
            if (nextSong != undefined){
                dispatch(setItemPlaying(nextSong.id))
            } else {
                dispatch(setSong(undefined))
                dispatch(stop())
            }
        }
        dispatch(removeFromPlaylist(item.id))
        dispatchAudioBlob({
            type: 'REMOVE_BLOB',
            payload: { id: item.id },
        })
    }
    return (
        <>
            <div className="grid grid-cols-3">
                <div className="col-span-1 p-2 flex items-center justify-center">
                    <img className="object-cover" src={item.thumbnailURL} />
                </div>
                <div className="col-span-2 flex flex-wrap justify-start items-stretch p-2 gap-2">
                    <div className="w-full flex justify-between items-start gap-2">
                        <p
                            className={
                                item.status === 'playing'
                                    ? `lg:text-md text-sm font-semibold overflow-hidden line-clamp-2 text-ellipsis whitespace-pre-line text-color-primary`
                                    : `lg:text-md text-sm font-semibold overflow-hidden line-clamp-2 text-ellipsis whitespace-pre-line`
                            }
                        >
                            {item.title}
                        </p>
                        <p className="lg:text-md text-sm font-semibold">
                            {item.duration}
                        </p>
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
                                e.stopPropagation()
                                handleItemRemoval(item)
                            }}
                        >
                            <Icon
                                className="text-lg -translate-y-1"
                                f7="xmark"
                            />
                        </Button>
                        {item.downloadStatus === 'error' && (
                            <Button
                                className="w-8 h-8 flex justify-center items-center"
                                tooltip="Retry"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    dispatch(setItemRetry(item.id))
                                }}
                            >
                                <Icon
                                    className="text-lg -translate-y-1"
                                    f7="arrow_clockwise"
                                />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
