import { Icon, Link } from 'framework7-react'
import React from 'react'
import { ChannelResult } from '@/typescript/interfaces'

interface ChannelResultCardProps {
    data: ChannelResult
}

export default function ChannelResultCard(props: ChannelResultCardProps) {
    const targetImage = props.data.channelThumbnails.find(
        (thumbnail) => thumbnail.quality === 'medium'
    )

    return (
        <>
            <article className="p-4">
                <div className="relative group w-full asepect-square flex justify-center">
                    {/* Overlay for subscribers */}
                    <div className="absolute right-0 bottom-0">
                        <p className="bg-black/60 p-1 align-middle">
                            {props.data.subCount} Subscribers
                        </p>
                    </div>
                    {/* Left top badge for channel */}
                    <div className="absolute top-0 left-0">
                        <p className="bg-black/60 p-1 align-middle">Channel</p>
                    </div>
                    {/* Overlays */}
                    <a
                        className="absolute w-full h-full hidden group-hover:flex bg-black/60 backdrop-blur-sm flex-wrap justify-center items-center"
                        href={`/channel/${props.data.authorId}`}>
                        <Icon
                            className="text-lg lg:text-2xl xl:text-4xl w-full"
                            f7="music_albums"
                        />
                        <p className="text-md lg:text-lg xl:text-xl text-center">
                            View Channel
                        </p>
                    </a>
                    {/* Image here */}
                    <img
                        className="w-36 h-36 asepect-square object-contain rounded-full"
                        src={targetImage?.url}
                    />
                </div>
                {/* ChannelTitle Title Here */}
                <Link
                    href={`/channel/${props.data.authorId}`}
                    className="mt-2  line-clamp-2 underline">
                    {props.data.author}
                </Link>
            </article>
        </>
    )
}
