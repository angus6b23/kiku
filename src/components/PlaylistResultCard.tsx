import { Icon, Link } from 'framework7-react'
import React, { useState } from 'react'
import { PlaylistResult } from './interfaces'
import { useDispatch, useSelector } from 'react-redux'
import { addToNextSong, addToPlaylist, selectPlaylist } from '@/store/playlist'

interface SearchResultProps {
    data: PlaylistResult
}

export default function PlaylistResultCard(props: SearchResultProps) {
    const targetImage = props.data.playlistThumbnails.find(
        (thumbnail) => thumbnail.quality === 'medium'
    )
    const [iconText, setIconText] = useState('')
    const dispatch = useDispatch()

    const displayPlaylist = () => {
        console.log('display playlist')
    }
    const handleAddToPlaylist = () => {
        console.log('add all items to playlist')
    }
    const handleAddToNextSong = () => {}
    return (
        <>
            <article className="p-4">
                <div className="relative group w-full aspect-video">
                    {/* Overlay for time */}
                    <div className="absolute right-0 bottom-0">
                        <p className="bg-black/60 p-1 align-middle">
                            {`${props.data.vidCount} Videos`}
                        </p>
                    </div>
                    {/* Overlay for playlist icon */}
                    <div className="group-hover:hidden absolute left-0 top-0 w-1/2 h-full bg-black/60 flex justify-center items-center">
                        <Icon className="text-3xl" f7="list_dash" />
                    </div>
                    {/* Overlay for various buttons */}
                    <div className="group-hover:grid hidden grid-cols-2 grid-rows-9 absolute w-full h-full group-hover:bg-black/60 group-hover:backdrop-blur-sm duration-100">
                        <div
                            className="cursor-pointer flex justify-center items-center col-span-2 row-span-4 flex-wrap"
                            onMouseEnter={() => setIconText('Browse')}
                            onMouseLeave={() => setIconText('')}
                            onClick={displayPlaylist}
                        >
                            <Icon
                                className="text-lg lg:text-2xl xl:text-4xl"
                                f7="list_bullet_below_rectangle"
                            />
                        </div>
                        <div className="flex justify-center align-middle col-span-2 cursor-default">
                            <p className="text-md lg:text-lg xl:text-xl text-center">
                                {iconText}
                            </p>
                        </div>
                        <div
                            className="flex justify-center align-middle row-span-4 cursor-pointer items-center"
                            onMouseEnter={() => setIconText('Add all items')}
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
                                setIconText('Replace current playlist')
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
                    {/* Image here */}
                    <img
                        className="w-full max-h-30 object-contain"
                        src={targetImage?.url}
                    />
                </div>
                {/* Video Title Here */}
                <Link
                    animate={false}
                    onClick={displayPlaylist}
                    className="mt-2  line-clamp-2"
                >
                    {props.data.title}
                </Link>
                {/* Author and views info here */}
                <div className="flex flex-wrap gap-2">
                    <Link
                        className="underline"
                        href={`channel/${props.data.authorId}`}
                    >
                        {props.data.author}
                    </Link>
                </div>
            </article>
        </>
    )
}
