import presentToast from '@/components/Toast'
import { Instance, Thumbnail, VideoDetails } from '@/components/interfaces'
import { extractInnertubeThumbnail } from '@/utils/thumbnailExtract'
import axios from 'axios'
import Innertube from 'youtubei.js/agnostic'
import { CompactVideo } from 'youtubei.js/dist/src/parser/nodes'

interface InvidiousDetails {
    title: string
    videoId: string
    videoThumbnails: Thumbnail[]
    description: string
    descriptionHtml: string
    published: number
    publishedText: string
    keywords: string[]
    viewCount: number
    likeCount: number
    dislikeCount: number

    paid: boolean
    premium: boolean
    isFamilyFriendly: boolean
    allowedRegions: string[]
    genre: string
    genreUrl: string

    author: string
    authorId: string
    authorUrl: string
    authorThumbnails: {
        url: string
        width: number
        height: number
    }[]
    subCountText: string
    lengthSeconds: number
    allowRatings: boolean
    rating: number
    isListed: boolean
    liveNow: boolean
    isUpcoming: boolean
    premiereTimestamp?: number

    hlsUrl?: string
    adaptiveFormats: {
        index: string
        bitrate: string
        init: string
        url: string
        itag: string
        type: string
        clen: string
        lmt: string
        projectionType: number
        container: string
        encoding: string
        qualityLabel?: string
        resolution?: string
    }[]
    formatStreams: {
        url: string
        itag: string
        type: string
        quality: string
        container: string
        encoding: string
        qualityLabel: string
        resolution: string
        size: string
    }[]
    captions: {
        label: string
        languageCode: string
        url: string
    }[]
    recommendedVideos: {
        videoId: string
        title: string
        videoThumbnails: Thumbnail[]
        author: string
        authorId: string
        lengthSeconds: number
        viewCountText: string
    }[]
}
const videoDetailInv = async (id: string, baseUrl: string) => {
    try {
        const res = await axios({
            method: 'get',
            baseURL: baseUrl,
            url: `/api/v1/videos/${id}`,
        })
        const { data }: { data: InvidiousDetails } = res
        const recommendedVideos: VideoDetails['recommendedVideos'] =
            data.recommendedVideos.map((item) => {
                return {
                    type: 'video',
                    title: item.title,
                    videoId: item.videoId,
                    author: item.author,
                    authorId: item.authorId,
                    videoThumbnails: item.videoThumbnails,
                    lengthSeconds: item.lengthSeconds,
                }
            })
        return {
            type: 'video',
            title: data.title,
            videoId: data.videoId,
            author: data.author,
            authorId: data.authorId,
            videoThumbnails: data.videoThumbnails,
            viewCount: data.viewCount,
            lengthSeconds: data.lengthSeconds,
            description: data.description,
            published: data.published,
            keywords: data.keywords,
            likeCount: data.likeCount,
            genre: data.genre,
            recommendedVideos: recommendedVideos,
        } as VideoDetails
    } catch (err) {
        return new Error('invidious > ' + err)
    }
}
const videoDetailInner = async (id: string, innertube: Innertube | null) => {
    if (innertube === null) {
        return new Error('innertube is null')
    }
    try {
        const res = await innertube.getInfo(id)
        const thumbnails = res.basic_info.thumbnail as {
            url: string
            height: number
            width: number
        }[]
        const publishDateTime = res.primary_info?.published.text as string
        const publishTime = new Date(publishDateTime).getTime() / 1000
        const recommendedVideos = res.watch_next_feed
            ?.filter((item) => item.type === 'CompactVideo')
            .map((item) => {
                const video = item as CompactVideo
                return {
                    type: 'video',
                    title: video.title.text as string,
                    videoId: video.id,
                    author: video.author.name,
                    authorId: video.author.id,
                    videoThumbnails: extractInnertubeThumbnail(
                        video.thumbnails
                    ),
                    lengthSeconds: video.duration.seconds,
                }
            })
        return {
            type: 'video',
            title: res.basic_info.title as string,
            videoId: res.basic_info.id as string,
            author: res.basic_info.author as string,
            authorId: res.basic_info.channel_id as string,
            videoThumbnails: extractInnertubeThumbnail(thumbnails),
            viewCount: res.basic_info.view_count as number,
            lengthSeconds: res.basic_info.duration as number,
            description: res.basic_info.short_description as string,
            published: publishTime,
            keywords: [],
            likeCount: res.basic_info.like_count,
            genre: '',
            recommendedVideos: recommendedVideos,
        } as VideoDetails
    } catch (err) {
        return new Error('innertube > ' + err)
    }
}

export async function getVideoDetail(
    id: string,
    instances: Instance[],
    innertube: Innertube | null
): Promise<VideoDetails> {
    let res: Error | VideoDetails
    if (instances.length === 0) {
        throw new Error('error on handle search')
    }

    if (instances[0].enabled === false) {
        return await getVideoDetail(id, instances.slice(1), innertube)
    }

    switch (instances[0].type) {
        case 'local':
            res = await videoDetailInner(id, innertube)
            break
        case 'invidious':
            res = await videoDetailInv(id, instances[0].url)
            break
        case 'piped':
            res = await searchPiped(keyword, options, instances[0].url)
            break
        default:
            throw new Error('Unknown instance in handle Search')
    }
    if (res instanceof Error) {
        presentToast('error', 'video detail > ' + res.message)
        return await getVideoDetail(id, instances.slice(1), innertube)
    }
    return res
}
