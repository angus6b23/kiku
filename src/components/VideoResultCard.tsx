import { Icon, Link } from 'framework7-react'
import React, { useState } from 'react'
import { VideoResult } from './interfaces'
import { Playitem } from './interfaces'
import { formatViewNumber, convertSecond } from '../utils/format'
import { useDispatch, useSelector } from 'react-redux'
import {
    addToNextSong,
    addToPlaylist,
    selectPlaylist,
} from '@/store/playlistReducers'
import { useTranslation } from 'react-i18next'

interface VideoResultCardProps {
    data: VideoResult
}

export default function VideoResultCard(props: VideoResultCardProps) {
    const targetImage = props.data.videoThumbnails.find(
        (thumbnail) => thumbnail.quality === 'medium'
    )
    const highResImage = props.data.videoThumbnails.find(
        (thumbnail) => thumbnail.quality === 'maxres' || 'maxresdefault'
    )
    const [iconText, setIconText] = useState('')
    const playlist: Playitem[] = useSelector(selectPlaylist)
    const dispatch = useDispatch()
    const { t } = useTranslation(['common', 'search-result'])

    const handleAddToPlaylist = () => {
        const sameId = playlist.filter(
            (item: Playitem) => item.id === props.data.videoId
        )
        if (sameId.length > 0) return
            const newPlayitem: Playitem = {
                id: props.data.videoId,
                title: props.data.title,
                thumbnailURL: highResImage === undefined ? '' : highResImage.url,
                duration: convertSecond(props.data.lengthSeconds),
                status: 'added',
                downloadStatus: 'pending',
            }
            dispatch(addToPlaylist(newPlayitem))
    }
    const handleAddToNextSong = () => {
        const sameId = playlist.filter(
            (item: Playitem) => item.id === props.data.videoId
        )
        if (sameId.length > 0) return
            const newPlayitem: Playitem = {
                id: props.data.videoId,
                title: props.data.title,
                thumbnailURL: targetImage === undefined ? '' : targetImage.url,
                duration: convertSecond(props.data.lengthSeconds),
                status: 'added',
                downloadStatus: 'pending',
            }
            dispatch(addToNextSong(newPlayitem))
    }
    const onPlaylist = () => {
        return playlist.some((item) => item.id === props.data.videoId)
    }
    return (
        <>
            <article className="p-4">
                <div className="relative group w-full aspect-video">
                    {/* Overlay for time */}
                    <div className="absolute right-0 bottom-0">
                        <p className="bg-black/60 p-1 align-middle">
                            {convertSecond(props.data.lengthSeconds)}
                        </p>
                    </div>
                    {/* Overlay for various buttons */}
                    {onPlaylist() ? (
                        <div className="group-hover:flex flex-wrap hidden absolute group-hover:bg-black/60 group-hover:backdrop-blur-sm duration-100 w-full h-full items-center justify-center cursor-default">
                            <Icon
                                f7="checkmark_alt_circle_fill"
                                className="text-xl lg:text-4xl xl:text-6xl w-full"
                            />
                            <p className="text-md lg:text-lg xl:text-xl">
                                {t('search-result:Already-on-playlist')}
                            </p>
                        </div>
                    ) : (
                        <div className="group-hover:grid hidden grid-cols-2 grid-rows-9 absolute w-full h-full group-hover:bg-black/60 group-hover:backdrop-blur-sm duration-100">
                            <div
                                className="cursor-pointer flex justify-center items-center col-span-2 row-span-4 flex-wrap"
                                onMouseEnter={() =>
                                    setIconText(
                                        t('search-result:Add-to-playlist')
                                )
                                }
                                onMouseLeave={() => setIconText('')}
                                onClick={handleAddToPlaylist}
                            >
                                <Icon
                                    className="text-lg lg:text-2xl xl:text-4xl"
                                    f7="plus_rectangle_fill"
                                />
                            </div>
                            <div className="flex justify-center align-middle col-span-2 cursor-default">
                                <p className="text-md lg:text-lg xl:text-xl text-center">
                                    {iconText}
                                </p>
                            </div>
                            <div
                                className="flex justify-center align-middle row-span-4 cursor-pointer items-center"
                                onMouseEnter={() => setIconText('Play Now')}
                                onMouseLeave={() => setIconText('')}
                            >
                                <Icon
                                    className="text-lg lg:text-2xl xl:text-4xl"
                                    f7="play_fill"
                                />
                            </div>
                            <div
                                className="flex justify-center row-span-4 align-middle cursor-pointer items-center"
                                onMouseEnter={() =>
                                    setIconText(
                                        t('search-result:Add-to-next-song')
                                )
                                }
                                onMouseLeave={() => setIconText('')}
                                onClick={handleAddToNextSong}
                            >
                                <Icon
                                    className="text-lg lg:text-2xl xl:text-4xl"
                                    f7="arrow_right_to_line"
                                />
                            </div>
                        </div>
                    )}
                    {/* Image here */}
                    <img
                        className="w-full max-h-30 object-contain"
                        src={targetImage?.url}
                    />
                </div>
                {/* Video Title Here */}
                <Link
                    animate={false}
                    onClick={handleAddToPlaylist}
                    className="mt-2  line-clamp-2"
                >
                    {props.data.title}
                </Link>
                {/* Author and views info here */}
                <div className="flex flex-wrap gap-2">
                    <Link
                        className="underline"
                        target="_self"
                        href={`/channel/${props.data.authorId}`}
                    >
                        {props.data.author}
                    </Link>
                    {props.data.viewCount !== undefined &&
                    <p>
                        {formatViewNumber(props.data.viewCount)}{' '}
                        {t('common:views')}
                    </p>
                    }
                </div>
            </article>
        </>
    )
}
