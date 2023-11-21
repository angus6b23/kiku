import presentToast from '@/components/Toast'
import { Instance, VideoResult } from '@/components/interfaces'
import Innertube from 'youtubei.js/agnostic'
import { C4TabbedHeader, GridVideo } from 'youtubei.js/dist/src/parser/nodes'
import { extractInnertubeThumbnail, generatePipedThumbnail } from './search'
import { formatViewNumber, toSecond } from '@/utils/format'
import { Thumbnail } from '@/components/interfaces'
import axios from 'axios'

interface InvidiousRes {
    type: 'video' | 'playlist' | 'channel'
    title?: string
    author: string
    authorId: string
    videoId?: string
    playlistId?: string
    videoThumbnails?: Thumbnail[]
    lengthSeconds?: number
    viewCount?: number
    videoCount?: number
    subCount?: number
    videos?: { videoThumbnails: Thumbnail[] }[]
    authorThumbnails: { url: string; width: number; height: number }[]
}
interface PipedRes {
    type: 'stream' | 'channel' | 'playlist'
    url: string
    name?: string
    title?: string
    uploaderName?: string
    uploaderUrl?: string
    duration?: number
    views?: number
    videos?: number
    thumbnail: string
    subscribers?: number
}
interface ChannelData {
    channelInfo: {
        name: string
        // thumbnail: string
        subscribers: string
        videoCount: number
    }

    videos: VideoResult[]
    playlists?: any[]
}

const channelInner = async (id: string, innertube: Innertube | null) => {
    if (innertube === null) {
        return new Error('innertube is null')
    }
    try {
        const res = await innertube.getChannel(id)
        const header = res.header as C4TabbedHeader
        // const videos = await res.getVideos();
        // const playlist = await res.getPlaylists()
        const info = {
            name: res.metadata.title as string,
            subscribers: header.subscribers?.text?.replace(
                / subscribers$/,
                ''
            ) as string,
            videoCount: Number(
                header.videos_count?.text?.replace(/ videos$/, '')
            ) as number,
        }
        const videoArr: (VideoResult | undefined)[] = res.videos.map(
            (video) => {
                const gridVideo = video as GridVideo
                if (video.type === 'GridVideo') {
                    return {
                        type: 'video',
                        title: gridVideo.title.text as string,
                        videoId: gridVideo.id,
                        author: res.metadata.title as string,
                        authorId: id as string,
                        videoThumbnails: extractInnertubeThumbnail(
                            gridVideo.thumbnails
                        ),
                        viewCount: Number(
                            gridVideo.views.text
                                ?.replace(/ views$/, '')
                                .replace(/,/g, '')
                        ),
                        lengthSeconds: toSecond(
                            gridVideo.duration?.text as string
                        ),
                    }
                } else {
                    return undefined
                }
            }
        )
        const videos = videoArr.filter(
            (item) => item !== undefined
        ) as VideoResult[]
        return {
            channelInfo: info,
            videos: videos,
        }
    } catch (err) {
        return new Error(err as string)
    }
}
const channelInv = async (id: string, baseUrl: string) => {
    try {
        const { data } = await axios({
            baseURL: baseUrl,
            url: `api/v1/channels/${id}`,
        })
        const info = {
            name: data.author,
            subscribers: formatViewNumber(data.subCount),
            videoCount: data.latestVideos.length,
        }
        const videos: VideoResult[] = data.latestVideos.map(
            (video: InvidiousRes) => {
                return {
                    type: 'video',
                    title: video.title,
                    videoId: video.videoId,
                    author: video.author,
                    authorId: video.authorId,
                    videoThumbnails: video.videoThumbnails,
                    viewCount: video.viewCount,
                    lengthSeconds: video.lengthSeconds,
                }
            }
        )
        return {
            channelInfo: info,
            videos: videos,
        }
    } catch (err) {
        return new Error(err as string)
    }
}

const channelPiped = async (id: string, baseUrl: string) => {
    try {
        const { data } = await axios({
            baseURL: baseUrl,
            url: `channel/${id}`,
        })
        const info = {
            name: data.name,
            subscribers: formatViewNumber(data.subscriberCount),
            videoCount: data.relatedStreams.length,
        }
        let videos: VideoResult[] = data.relatedStreams.map(
            (video: PipedRes) => {
                if (video.type === 'stream') {
                    return {
                        type: 'video',
                        title: video.title,
                        videoId: video.url.replace(/^\/watch\?v=/, ''),
                        author: data.author,
                        authorId: id,
                        videoThumbnails: generatePipedThumbnail(
                            video.thumbnail
                        ),
                        viewCount: video.views,
                        lengthSeconds: video.duration,
                    }
                } else {
                    return undefined
                }
            }
        )
        videos = videos.filter((item) => item !== undefined)
        return {
            channelInfo: info,
            videos: videos,
        }
    } catch (err) {
        console.error(err)
        return new Error(err as string)
    }
}

export async function fetchChannelDetails(
    id: string,
    instances: Instance[],
    innertube: Innertube | null
): Promise<ChannelData | Error | undefined> {
    let res: ChannelData | Error
    if (id === '') {
        return undefined
    }
    if (instances.length === 0) {
        throw new Error('error on handle search')
    }

    if (instances[0].enabled === false) {
        return await fetchChannelDetails(id, instances.slice(1), innertube)
    }

    switch (instances[0].type) {
        case 'local':
            res = await channelInner(id, innertube)
            break
        case 'invidious':
            res = await channelInv(id, instances[0].url)
            break
        case 'piped':
            res = await channelPiped(id, instances[0].url)
            break
        default:
            throw new Error('Unknown instance in handle Search')
    }

    if (res instanceof Error) {
        console.error(res)
        presentToast('error', res.message)
        return await fetchChannelDetails(id, instances.slice(1), innertube)
    }
    return res
}
