import React, { useRef, type ReactElement } from 'react'
import { Playitem } from './interfaces'
import { Button, Icon } from 'framework7-react'
import { useDispatch, useSelector } from 'react-redux'
import {
    removeFromPlaylist,
    selectPlaylist,
    setItemDownloadStatus,
    setItemPlaying,
} from '@/store/playlistReducers'
import { Store, useCustomContext } from './context'
import { getNextSong } from '@/utils/songControl'
import { setSong, stop } from '@/store/playerReducers'
import {selectConfig} from '@/store/globalConfig'
import presentToast from './Toast'
import {nanoid} from 'nanoid'
import {useTranslation} from 'react-i18next'

export interface PlayItemInnerProps {
    item: Playitem
}

export default function PlayItemInner(props: PlayItemInnerProps): ReactElement {
    const { item } = props
    const dispatch = useDispatch()
    const playlist = useSelector(selectPlaylist)
    const config = useSelector(selectConfig)
    const { dispatchAudioBlob } = useCustomContext(Store)
    const { t } = useTranslation(['playlist'])
    const popoverClass = useRef('popover-' + nanoid(5))

    const getInstanceUrl = (arg0: 'invidious' | 'piped') => {
        return config.instance.preferType.find(item => item.type === arg0)?.url
    }

    const handleItemRemoval = (item: Playitem) => {
        if (item.status === 'playing') {
            const nextSong = getNextSong(playlist)
            if (nextSong != undefined) {
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
    const handleCopy = (type: string) =>{
        switch(type){
            case "youtube":
                navigator.clipboard.writeText(`https://youtu.be/${props.item.id}`)
                break;
            case "invidious":
                navigator.clipboard.writeText(`${getInstanceUrl('invidious')}/watch?v=${props.item.id}}`)
                break;
            case "piped":
                navigator.clipboard.writeText(`${getInstanceUrl('piped')}/watch?v=${props.item.id}}`)
                break;
            default:
                throw new Error('unknown type to copy')
        }
        presentToast('success', `Copied ${type} link`)
        // f7.popover.close(popoverClass.current)
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
                            tooltip={t('playlist:Save-to-drive')}
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
                        {/* <Button className="w-8 h-8 flex justify-center items-center" */}
                        {/*     tooltip="Get links" */}
                        {/*     onClick={(e)=>{ */}
                        {/*         e.stopPropagation() */}
                        {/*     }} */}
                        {/*     popoverOpen={`.${popoverClass.current}`} */}
                        {/* > */}
                        {/*     <Icon */}
                        {/*         className="text-lg -translate-y-1" */}
                        {/*         f7="link" */}
                        {/*     /> */}
                        {/* </Button> */}
                        {item.downloadStatus === 'error' && (
                            <Button
                                className="w-8 h-8 flex justify-center items-center"
                                tooltip={t('playlist:Retry')}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    dispatch(setItemDownloadStatus({id: item.id, status: 'pending'}))
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
            {/* <Popover backdrop={false} className={popoverClass.current}> */}
            {/*     <List className="cursor-pointer"> */}
            {/*         <ListItem className="text-md" onClick={() => handleCopy('youtube')} title="Copy Youtube link"> */}
            {/*             <Icon slot="media" f7="doc_on_clipboard" /> */}
            {/*         </ListItem> */}
            {/*         <ListItem className="text-md" onClick={() => handleCopy('invidious')} title="Copy Invidious link"> */}
            {/*             <Icon slot="media" f7="doc_on_clipboard" /> */}
            {/*         </ListItem> */}
            {/*         <ListItem className="text-md" onClick={() => handleCopy('piped')} title="Copy Piped link"> */}
            {/*             <Icon slot="media" f7="doc_on_clipboard" /> */}
            {/*         </ListItem> */}
            {/*     </List> */}
            {/* </Popover> */}
        </>
    )
}
