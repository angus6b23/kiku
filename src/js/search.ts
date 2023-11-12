import axios from 'axios'
import {
    ChannelResult,
    Instance,
    PlaylistResult,
    Search,
    SearchResult,
    Thumbnail,
    VideoResult,
} from '../components/interfaces'
import Innertube from 'youtubei.js/agnostic'
import { Channel, Playlist, Video } from 'youtubei.js/dist/src/parser/nodes'
import { Author } from 'youtubei.js/dist/src/parser/misc'
import presentToast from '@/components/Toast'
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

const extractInnertubeThumbnail = (
    array: { url: string; width: number; height: number }[]
) => {
    const maxresThumbnail: Thumbnail = {
        quality: 'maxres',
        url: array[0].url,
        height: array[0].height,
        width: array[0].width,
    }
    const mediumThumbnail: Thumbnail = array[1]
        ? {
            quality: 'medium',
            url: array[1].url,
            height: array[1].height,
            width: array[1].width,
        }
            : { ...maxresThumbnail, quality: 'medium' }
            return [maxresThumbnail, mediumThumbnail]
}
const extractInvidiousChannelThumbnail = (
    array: { url: string; width: number; height: number }[]
) => {
    const thumbnails = array.sort((a, b) => b.width - a.width)
    return thumbnails.map((state, index) =>
                          index === 0
                              ? { ...state, quality: 'maxres' }
                              : index === 1
                                  ? { ...state, quality: 'medium' }
                                  : { ...state, quality: '' }
                         )
}
const generatePipedThumbnail = ( url: string ) => {
    const img = new Image();
    img.src = url
    const thumbnail = {
        width: img.width,
        height: img.height,
        url: url,
    }
    return [{...thumbnail, quality: 'maxres'}, {...thumbnail, quality: 'medium'}]
}
export async function searchInv(
    keyword: string,
    options: Search,
    baseUrl: string
) {
    try {
        const res = await axios({
            method: 'get',
            baseURL: baseUrl,
            url: 'api/v1/search',
            params: {
                q: keyword,
                page: options.page,
                sort_by: options.sort_by,
                type: options.type,
            },
        })
        const searchResults: (SearchResult | undefined)[] = res.data.map(
            (item: InvidiousRes) => {
                if (item.type === 'video') {
                    const {
                        title,
                        videoId,
                        author,
                        authorId,
                        viewCount,
                        lengthSeconds,
                    } = item
                    const newVideo: VideoResult = {
                        type: 'video',
                        title: title as string,
                        videoId: videoId as string,
                        author: author,
                        authorId: authorId,
                        videoThumbnails: item.videoThumbnails as Thumbnail[],
                        viewCount: viewCount as number,
                        lengthSeconds: lengthSeconds as number,
                    }
                    return newVideo
                } else if (item.type === 'playlist') {
                    const {
                        title,
                        playlistId,
                        author,
                        authorId,
                        videos,
                        videoCount,
                    } = item
                    const thumbnails =
                        videos === undefined ? [] : videos[0].videoThumbnails
                    const newPlaylist: PlaylistResult = {
                        type: 'playlist',
                        title: title as string,
                        playlistId: playlistId as string,
                        author: author,
                        authorId: authorId,
                        playlistThumbnails: thumbnails,
                        vidCount: videoCount as number,
                    }
                    return newPlaylist
                } else if (item.type === 'channel') {
                    const { author, authorId, subCount, authorThumbnails } =
                        item
                    const newChannel: ChannelResult = {
                        type: 'channel',
                        author: author,
                        authorId: authorId,
                        channelThumbnails:
                            extractInvidiousChannelThumbnail(authorThumbnails),
                        subCount: subCount?.toString() as string,
                    }
                    return newChannel
                } else {
                    return undefined
                }
            }
        )
        return searchResults.filter(
            (item) => item !== undefined
        ) as SearchResult[]
    } catch (err) {
        console.error(err)
        return new Error(err as string)
    }
}

async function searchInner(
    keyword: string,
    options: Search,
    innertube: Innertube | null
): Promise<Error | SearchResult[]> {
    try {
        if (innertube === null) {
            return new Error('innertube not found')
        }
        const res = await innertube.search(keyword, {
            sort_by: options.sort_by as
            | 'relevance'
            | 'rating'
            | 'upload_date'
            | 'view_count',
            type: options.type as 'all' | 'video' | 'channel' | 'playlist',
        })
        if (res.results === undefined || res.results === null) {
            throw new Error('innertube results not defined')
        }
        // console.log(res.results)
        const searchResults: (SearchResult | undefined)[] = res.results.map(
            (item) => {
                if (item.type === 'Video') {
                    const i = item as Video
                    let views = Number(
                        i.view_count.text
                            ?.replace(/ views$/, '')
                            .replaceAll(',', '')
                    )
                    views = isNaN(views) ? 0 : views
                    const newVideo: VideoResult = {
                        type: 'video',
                        title: i.title.text as string,
                        videoId: i.id,
                        author: i.author.name,
                        authorId: i.author.id,
                        videoThumbnails: extractInnertubeThumbnail(
                            i.thumbnails
                        ),
                        viewCount: views,
                        lengthSeconds: i.duration.seconds,
                    }
                    // console.log(newVideo)
                    return newVideo
                } else if (item.type === 'Playlist') {
                    const i = item as Playlist
                    const author = i.author as Author
                    let videoCount = Number(
                        i.video_count.text?.replace(/ videos$/, '')
                    )
                    videoCount = isNaN(videoCount) ? 0 : videoCount
                    const newPlaylist: PlaylistResult = {
                        type: 'playlist',
                        title: i.title.text as string,
                        playlistId: i.id,
                        author: author.name,
                        authorId: author.id,
                        playlistThumbnails: extractInnertubeThumbnail(
                            i.thumbnails
                        ),
                        vidCount: videoCount,
                    }
                    return newPlaylist
                } else if (item.type === 'Channel') {
                    const i = item as Channel
                    let subCount = i.video_count.text?.replace(
                        / subscribers$/,
                        ''
                    )
                    subCount = subCount === undefined ? '0' : subCount
                    const newChannel: ChannelResult = {
                        type: 'channel',
                        author: i.author.name,
                        authorId: i.author.id,
                        channelThumbnails: extractInnertubeThumbnail(
                            i.author.thumbnails
                        ),
                        subCount: subCount,
                    }
                    return newChannel
                } else {
                    return undefined
                }
            }
        )
        // console.log(searchResults)
        return searchResults.filter(
            (item) => item !== undefined
        ) as SearchResult[]
    } catch (err) {
        return new Error(err as string)
    }
}

async function searchPiped(keyword: string, options: Search, baseUrl: string){
    try{
        const res = await axios({
            method: 'get',
            baseURL: baseUrl,
            url: 'search',
            params: {
                q: keyword,
                filter: options.type
            },
        })
        const searchResults: (SearchResult | undefined)[] = res.data.items.map(
            (item: PipedRes) => {
                if (item.type === 'stream') {
                    const {
                        title,
                        url,
                        uploaderName,
                        uploaderUrl,
                        views,
                        duration,
                        thumbnail
                    } = item
                    const newVideo: VideoResult = {
                        type: 'video',
                        title: title as string,
                        videoId: url.replace(/^\/watch\?v=/, ''),
                        author: uploaderName as string,
                        authorId: uploaderUrl?.replace(/^\/channel\//, '') as string,
                            videoThumbnails: generatePipedThumbnail(thumbnail),
                        viewCount: views as number,
                        lengthSeconds: duration as number,
                    }
                    return newVideo
                } else if (item.type === 'playlist') {
                    const {
                        name,
                        url,
                        uploaderName,
                        uploaderUrl,
                        thumbnail,
                        videos
                    } = item
                    const newPlaylist: PlaylistResult = {
                        type: 'playlist',
                        title: name as string,
                        playlistId: url.replace(/\/playlist\?list=/, ''),
                        author: uploaderName as string,
                        authorId: uploaderUrl?.replace(/\/channel\//, '') as string,
                            playlistThumbnails: generatePipedThumbnail(thumbnail),
                        vidCount: videos as number,
                    }
                    console.log(newPlaylist)
                    return newPlaylist
                } else if (item.type === 'channel') {
                    const { url, name, subscribers, thumbnail } =
                        item
                    const newChannel: ChannelResult = {
                        type: 'channel',
                        author: name as string,
                        authorId: url.replace(/\/channel\//, '') as string,
                            channelThumbnails: generatePipedThumbnail(thumbnail),
                        subCount: subscribers?.toString() as string
                    }
                    return newChannel
                } else {
                    return undefined
                }
            }
        )
        return searchResults.filter(
            (item) => item !== undefined
        ) as SearchResult[]
    } catch (err) {
        console.error(err)
        return new Error(err as string)
    }
}

export async function handleSearchVideo(
    keyword: string,
    options: Search,
    instances: Instance[],
    innertube: Innertube | null
): Promise<SearchResult[]> {
    let res: Error | SearchResult[]
    if (instances.length === 0) {
        throw new Error('error on handle search')
    }

    if (instances[0].enabled === false) {
        return handleSearchVideo(
            keyword,
            options,
            instances.slice(1),
            innertube
        )
    }

    switch (instances[0].type) {
        case 'local':
            res = await searchInner(keyword, options, innertube)
        break
        case 'invidious':
            res = await searchInv(keyword, options, instances[0].url)
        break
        case 'piped':
            res = await searchPiped(keyword, options, instances[0].url)
        break;
            default:
            throw new Error('Unknown instance in handle Search')
    }
    if (res instanceof Error) {
        console.error(res)
        presentToast('error', res.message)
        return handleSearchVideo(
            keyword,
            options,
            instances.slice(1),
            innertube
        )
    }
    return res
}
