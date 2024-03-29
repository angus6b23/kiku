import React, { type ReactElement } from 'react'
import { AudioBlobObject, Playitem } from '@/typescript/interfaces'
import { Button, Icon, f7 } from 'framework7-react'
import { useDispatch, useSelector } from 'react-redux'
import {
    removeFromPlaylist,
    selectPlaylist,
    setItemDownloadStatus,
    setItemPlaying,
} from '@/store/playlistReducers'
import { Store, useCustomContext } from '@/store/reactContext'
import { getNextSong } from '@/utils/songControl'
import { setSong, stop } from '@/store/playerReducers'
import presentToast from './Toast'
import { useTranslation } from 'react-i18next'

export interface PlayItemInnerProps {
    item: Playitem
}

export default function PlayItemInner(props: PlayItemInnerProps): ReactElement {
    const { item } = props
    const dispatch = useDispatch()
    const playlist = useSelector(selectPlaylist)
    const {
        dispatchAudioBlob,
        audioBlobStore,
        abortController,
    }: {
        dispatchAudioBlob: (arg0: {
            type: string
            payload: { id: string }
        }) => void
        audioBlobStore: AudioBlobObject[]
        abortController: { [key: string]: AbortController }
    } = useCustomContext(Store)
    const { t } = useTranslation(['playlist'])

    const handleItemRemoval = (item: Playitem) => {
        if (item.status === 'playing') {
            const nextSong = getNextSong(playlist)
            if (nextSong != undefined) {
                // If there is next song, just play the next song and remove the item normally
                dispatch(setItemPlaying(nextSong.id))
                dispatch(removeFromPlaylist(item.id))
                dispatchAudioBlob({
                    type: 'REMOVE_BLOB',
                    payload: { id: item.id },
                })
            } else {
                dispatch(removeFromPlaylist(item.id)) // Otherwise, we will remove the item first, then set the playing song to undefined to prevent triggering the autoplay in worker
                dispatchAudioBlob({
                    type: 'REMOVE_BLOB',
                    payload: { id: item.id },
                })
                setTimeout(() => {
                    // Use setTimeout to prevent previous dispatch not yet finished
                    dispatch(setSong(undefined))
                    dispatch(stop())
                }, 50)
            }
        } else {
            if (abortController[item.id] !== undefined) {
                abortController[item.id].abort()
            }
            dispatch(removeFromPlaylist(item.id))
            dispatchAudioBlob({
                type: 'REMOVE_BLOB',
                payload: { id: item.id },
            })
        }
    }
    const handleItemDownload = (e: CustomEvent, item: Playitem) => {
        e.stopPropagation() // Prevent item to be played
        if (item.downloadStatus != 'downloaded') {
            return
        } else {
            try {
                const audioBlob = audioBlobStore.find(
                    (blobItem) => blobItem.id === item.id
                ) as AudioBlobObject // Access the audio blob store to find blob with same id
                if (audioBlob === undefined) {
                    // Throw error if not found
                    throw new Error('Unable to find blob')
                }
                const blob = audioBlob.blob as Blob
                const blobFormat = blob.type.includes('webm') ? 'opus' : 'm4a' // Youtube seems to only provide audio in either opus or m4a
                const blobURL = URL.createObjectURL(blob) // Create url for download
                const link = document.createElement('a') // Create DOM node for download
                link.href = blobURL // Set download link
                link.download = `${item.title}.${blobFormat}` // Set default item name
                link.click() // Click to start downloading
            } catch (err) {
                presentToast('error', err as string)
            }
        }
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
                            className="lg:text-md text-sm font-semibold overflow-hidden line-clamp-2 text-ellipsis whitespace-pre-line"
                            style={
                                item.status === 'playing'
                                    ? { color: 'var(--f7-theme-color)' }
                                    : {}
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
                            tooltip={t('search-result:Details')}
                            onClick={(e) => {
                                e.stopPropagation()
                                f7.views
                                    .get('#page-router')
                                    .router.navigate(
                                        `/details/${props.item.id}`
                                    )
                            }}
                        >
                            <Icon
                                className="text-lg -translate-y-1"
                                f7="info"
                            />
                        </Button>
                        <Button
                            className="w-8 h-8 flex justify-center items-center"
                            tooltip={t('playlist:Save-to-drive')}
                            onClick={(e) => handleItemDownload(e, item)}
                        >
                            <Icon
                                className="text-lg -translate-y-1"
                                f7="floppy_disk"
                            />
                        </Button>
                        <Button
                            className="w-8 h-8 flex justify-center items-center"
                            tooltip={t('playlist:Remove-from-playlist')}
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
                                tooltip={t('playlist:Retry')}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    dispatch(
                                        setItemDownloadStatus({
                                            id: item.id,
                                            status: 'pending',
                                        })
                                    )
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
