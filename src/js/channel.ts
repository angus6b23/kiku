import presentToast from '@/components/Toast'
import { Instance, PlaylistResult, VideoResult } from '@/components/interfaces'
import Innertube from 'youtubei.js/agnostic'
import { C4TabbedHeader, Video } from 'youtubei.js/dist/src/parser/nodes'
import { extractInnertubeThumbnail, generatePipedThumbnail } from '@/utils/thumbnailExtract'
import { formatViewNumber, toSecond } from '@/utils/format'
import { Thumbnail } from '@/components/interfaces'
import axios from 'axios'
import { Channel, ChannelListContinuation } from 'youtubei.js/dist/src/parser/youtube'
import {Author} from 'youtubei.js/dist/src/parser/misc'
import { ChannelData } from '@/components/interfaces'

interface InvidiousRes {
    type: 'video' | 'playlist' | 'channel'
    title?: string
    author: string
    authorId: string
    videoId?: string
    playlistId?: string
    videoThumbnails?: Thumbnail[]
    playlistThumbnail?: string
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

const channelInner = async (id: string, innertube: Innertube | null) => {
    if (innertube === null) {
        return new Error('innertube is null')
    }
    try {
        const res = await innertube.getChannel(id)
        const channelRes = res as Channel
        const header = channelRes.header as C4TabbedHeader
        const author = header.author as Author
        const info = {
            name: channelRes.metadata.title as string,
            subscribers: header.subscribers?.text?.replace(
                / subscribers$/,
                ''
            ) as string,
            videoCount: Number(
                header.videos_count?.text?.replace(/ videos$/, '')
            ) as number,
        }
        const videoRes = await res.getVideos();
        const videoArr: (VideoResult | undefined)[] = videoRes.videos.map(
            (video) => {
                const innerVideo = video as Video
                if (video.type === 'Video') {
                    return {
                        type: 'video',
                        title: video.title.text as string,
                        videoId: innerVideo.id,
                        author: author.name as string,
                        authorId: author.id as string,
                        videoThumbnails: extractInnertubeThumbnail(
                            innerVideo.thumbnails
                        ),
                        viewCount: Number(
                            innerVideo.view_count.text
                                ?.replace(/ views$/, '')
                                .replace(/,/g, '')
                        ),
                        lengthSeconds: toSecond(
                            innerVideo.duration?.text as string
                        ),
                    }
                } else {
                    return undefined
                }
            }
        )
        const playlistRes = await res.getPlaylists()
        console.log(playlistRes)
        const playlist: PlaylistResult[] = playlistRes.playlists.map(playlist => {
            return {
                type: 'playlist',
                title: playlist.title.text as string,
                playlistId: playlist.id,
                author: author.name,
                authorId: author.id,
                playlistThumbnails: extractInnertubeThumbnail(playlist.thumbnails),
                vidCount: Number(playlist.video_count_short.text)
            }
        })
        const videoHasContinuation = videoRes.has_continuation
        const playlistHasContinuation = playlistRes.has_continuation
        return {
            channelInfo: info,
            videos: videoArr.filter(item => item !== undefined),
            playlists: playlist,
            videoContinuation: videoHasContinuation ? res : undefined,
            playlistContinuation: playlistHasContinuation ? res : undefined
        } as ChannelData
    } catch (err) {
        return new Error('innertube > ' + err)
    }
}

const channelInv = async (id: string, baseUrl: string) => {
    try {
        const basicAxios = axios ({
            baseURL: baseUrl,
            url: `api/v1/channels/${id}`,
        })
        const videoAxios = axios({
            baseURL: baseUrl,
            url: `api/v1/channels/${id}/videos`,
            params:{
                sort_by: 'newest'
            }
        })
        const playlistAxios = axios({
            baseURL: baseUrl,
            url: `api/v1/channels/${id}/playlists`,
            params:{
                sort_by: 'newest'
            }
        })
        const [basicInfo, videoRes, playlistRes] = await Promise.all([basicAxios, videoAxios, playlistAxios])
        const info = {
            name: basicInfo.data.author as string,
            subscribers: formatViewNumber(basicInfo.data.subCount) as string,
            videoCount: basicInfo.data.latestVideos.length as number,
        }
        const videos: VideoResult[] = videoRes.data.videos.map(
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
        console.log(videoRes.data)
        const playlists: PlaylistResult[] = playlistRes.data.playlists.map((playlist: InvidiousRes) => {
            return {
                type: 'playlist',
                title: playlist.title as string,
                playlistId: playlist.playlistId as string,
                author: playlist.author as string,
                authorId: playlist.authorId as string,
                playlistThumbnails: generatePipedThumbnail(playlist.playlistThumbnail as string),
                vidCount: Number(playlist.videoCount)
            }
        })
        return {
            channelInfo: info,
            videos: videos,
            playlists: playlists,
            videoContinuation: videoRes.data.continuation,
            playlistContinuation: playlistRes.data.continuation
        } as ChannelData
    } catch (err) {
        return new Error('invidious > ' + err)
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
            continuation: data.nextpage
        }
    } catch (err) {
        return new Error('piped > ' + err)
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

export const handleChannelContinuation = async (instances: Instance[], innertube: Innertube, continuation: Channel | string | ChannelListContinuation) => {

}
