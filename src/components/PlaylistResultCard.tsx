import { Icon, Link, f7 } from 'framework7-react'
import React, { useState } from 'react'
import {
    Playitem,
    PlaylistResult,
    Thumbnail,
    PlaylistData,
} from '@/typescript/interfaces'
import { useDispatch, useSelector } from 'react-redux'
import {
    addToPlaylist,
    clearAllItems,
    selectPlaylist,
} from '@/store/playlistReducers'
import { handleGetPlaylist } from '@/js/playlist'
import { selectConfig } from '@/store/globalConfig'
import { Store, useCustomContext } from '@/store/reactContext'
import Innertube from 'youtubei.js/agnostic'
import presentToast from './Toast'
import { convertSecond } from '@/utils/format'
import { useTranslation } from 'react-i18next'

interface SearchResultProps {
    data: PlaylistResult
}

export default function PlaylistResultCard(props: SearchResultProps) {
    const targetImage = props.data.playlistThumbnails.find(
        (thumbnail) => thumbnail.quality === 'medium'
    )
    const [iconText, setIconText] = useState('')
    const config = useSelector(selectConfig)
    const playlist = useSelector(selectPlaylist)
    const dispatch = useDispatch()
    const { innertube }: { innertube: React.RefObject<Innertube | null> } =
        useCustomContext(Store)
    const { t } = useTranslation(['common', 'search-result'])

    const getHighResImage = (thumbnails: Thumbnail[]) => {
        return thumbnails.find(
            (thumbnail) => thumbnail.quality === 'maxres' || 'max'
        )
    }
    const handleAddAlltoPlaylist = async (id: string) => {
        const res: PlaylistData = await handleGetPlaylist(
            id,
            config.instance.preferType,
            innertube.current
        )
        if (res instanceof Error) {
            presentToast('error', 'error while getting playlist')
            return
        }
        res.videos.forEach((item) => {
            const sameId: boolean = playlist.some(
                (playitem) => playitem.id === item.videoId
            )
            if (!sameId) {
                const highResImage = getHighResImage(item.videoThumbnails)
                const newPlayitem: Playitem = {
                    id: item.videoId,
                    title: item.title,
                    thumbnailURL:
                        highResImage === undefined ? '' : highResImage.url,
                    duration: convertSecond(item.lengthSeconds),
                    status: 'added',
                    downloadStatus: 'pending',
                }
                setTimeout(() => {
                    dispatch(addToPlaylist(newPlayitem))
                }, 100)
            }
        })
    }
    const handleReplacePlaylist = (playlistId: string) => {
        f7.dialog.confirm(
            t('search-result:Replace-Playlist-Prompt'),
            t('search-result:Replace-current-playlist'),
            () => {
                dispatch(clearAllItems())
                handleAddAlltoPlaylist(playlistId)
            }
        )
    }
    return (
        <>
            <article className="p-4">
                <div className="relative group w-full aspect-video">
                    {/* Overlay for time */}
                    <div className="absolute right-0 bottom-0">
                        <p className="bg-black/60 p-1 align-middle">
                            {`${props.data.vidCount} ${t('common:Videos')}`}
                        </p>
                    </div>
                    {/* Overlay for playlist icon */}
                    <div className="group-hover:hidden absolute left-0 top-0 w-1/2 h-full bg-black/60 flex justify-center items-center">
                        <Icon className="text-3xl" f7="list_dash" />
                    </div>
                    {/* Overlay for various buttons */}
                    <div className="group-hover:grid hidden grid-cols-2 grid-rows-9 absolute w-full h-full group-hover:bg-black/60 group-hover:backdrop-blur-sm duration-100">
                        <a
                            className="cursor-pointer flex justify-center items-center col-span-2 row-span-4 flex-wrap"
                            onMouseEnter={() =>
                                setIconText(t('search-result:Browse-playlist'))
                            }
                            onMouseLeave={() => setIconText('')}
                            href={`/playlist/${props.data.playlistId}`}>
                            <Icon
                                className="text-lg lg:text-2xl xl:text-4xl"
                                f7="list_bullet_below_rectangle"
                            />
                        </a>
                        <div className="flex justify-center align-middle col-span-2 cursor-default">
                            <p className="text-md lg:text-lg xl:text-xl text-center">
                                {iconText}
                            </p>
                        </div>
                        <div
                            className="flex justify-center align-middle row-span-4 cursor-pointer items-center"
                            onMouseEnter={() =>
                                setIconText(
                                    t('search-result:Add-all-to-playlist')
                                )
                            }
                            onMouseLeave={() => setIconText('')}
                            onClick={() =>
                                handleAddAlltoPlaylist(props.data.playlistId)
                            }>
                            <Icon
                                className="text-lg lg:text-2xl xl:text-4xl"
                                f7="play_fill"
                            />
                        </div>
                        <div
                            className="flex justify-center row-span-4 align-middle cursor-pointer items-center"
                            onMouseEnter={() =>
                                setIconText(
                                    t('search-result:Replace-current-playlist')
                                )
                            }
                            onMouseLeave={() => setIconText('')}
                            onClick={() =>
                                handleReplacePlaylist(props.data.playlistId)
                            }>
                            <Icon
                                className="text-lg lg:text-2xl xl:text-4xl"
                                f7="arrow_right_to_line"
                            />
                        </div>
                    </div>
                    {/* Image here */}
                    <img
                        className="w-full max-h-30 object-contain"
                        src={targetImage?.url}
                    />
                </div>
                {/* Video Title Here */}
                <Link
                    href={`/playlist/${props.data.playlistId}`}
                    className="mt-2  line-clamp-2">
                    {props.data.title}
                </Link>
                {/* Author and views info here */}
                <div className="flex flex-wrap gap-2">
                    <Link
                        className="underline"
                        href={`/channel/${props.data.authorId}`}>
                        {props.data.author}
                    </Link>
                </div>
            </article>
        </>
    )
}
