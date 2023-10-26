import { Icon, Link } from 'framework7-react'
import React, { useState, type ReactElement } from 'react'
import { PlaylistAction, SearchResult } from './interfaces'
import { Playitem } from './interfaces'
interface searchResultCardProps {
    data: SearchResult
}
import { formatViewNumber, convertSecond } from '../utils/format'
import { Store, useCustomContext } from './context'
export default function searchResultCard(
    props: searchResultCardProps
): ReactElement {
    const targetImage = props.data.videoThumbnails.find(
        (thumbnail) => thumbnail.quality === 'medium'
    )
    const [iconText, setIconText] = useState('')
    const {
        playlist,
        dispatchPlaylist,
    }: {
        playlist: Playitem[]
        dispatchPlaylist: React.Dispatch<PlaylistAction>
    } = useCustomContext(Store)
    const handleAddToPlaylist = () => {
        const newPlayitem: Playitem = {
            id: props.data.videoId,
            title: props.data.title,
            thumbnailURL: targetImage === undefined ? '' : targetImage.url,
            duration: convertSecond(props.data.lengthSeconds),
            status: 'added',
            downloadStatus: 'pending',
        }
        dispatchPlaylist({ type: 'ADD', payload: newPlayitem })
    }
    const onPlaylist = () => {
        return playlist.some((item) => item.id === props.data.videoId)
    }
    return (
        <>
            <article className="p-4">
                <div className="relative group">
                    <div className="absolute right-0 bottom-0">
                        <p className="bg-black/60 p-1 align-middle">
                            {convertSecond(props.data.lengthSeconds)}
                        </p>
                    </div>
                    {onPlaylist() ? (
                        <div className="group-hover:flex flex-wrap hidden absolute group-hover:bg-black/60 group-hover:backdrop-blur-sm duration-100 w-full h-full items-center justify-center cursor-default">
                            <Icon
                                f7="checkmark_alt_circle_fill"
                                className="text-xl lg:text-4xl xl:text-6xl w-full"
                            />
                            <p className="text-md lg:text-lg xl:text-xl">
                                Added to Playlist
                            </p>
                        </div>
                    ) : (
                        <div className="group-hover:grid hidden grid-cols-2 grid-rows-9 absolute w-full h-full group-hover:bg-black/60 group-hover:backdrop-blur-sm duration-100">
                            <div
                                className="cursor-pointer flex justify-center items-center col-span-2 row-span-4 flex-wrap"
                                onMouseEnter={() =>
                                    setIconText('Add to playlist')
                                }
                                onMouseLeave={() => setIconText('')}
                                onClick={handleAddToPlaylist}
                            >
                                <Icon
                                    className="text-xl lg:text-4xl xl:text-6xl"
                                    f7="plus_rectangle_fill"
                                />
                            </div>
                            <div className="flex justify-center align-middle col-span-2 cursor-default">
                                <p className="text-lg xl:text-xl col-span-2 align-middle">
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
                                    setIconText('Add as next song')
                                }
                                onMouseLeave={() => setIconText('')}
                            >
                                <Icon
                                    className="text-lg lg:text-2xl xl:text-4xl"
                                    f7="arrow_right_to_line"
                                />
                            </div>
                        </div>
                    )}
                    <img
                        className="w-full max-h-30 object-contain"
                        src={targetImage?.url}
                    />
                </div>
                <Link className="mt-2">{props.data.title}</Link>
                <div className="flex flex-wrap gap-2">
                    <Link className="underline">{props.data.author}</Link>
                    <p>{formatViewNumber(props.data.viewCount)} views</p>
                </div>
            </article>
        </>
    )
}
