import axios from 'axios'
import {
    ChannelResult,
    Instance,
    PlaylistResult,
    SearchContinuation,
    SearchOption,
    SearchResult,
    VideoResult,
} from '../components/interfaces'
import { Search } from 'youtubei.js/dist/src/parser/youtube'
import Innertube from 'youtubei.js/agnostic'
import { Channel, Playlist, Video } from 'youtubei.js/dist/src/parser/nodes'
import { Author } from 'youtubei.js/dist/src/parser/misc'
import presentToast from '@/components/Toast'
import { extractInnertubeThumbnail } from '@/utils/thumbnailExtract'
import {
    InvidiousChannel,
    InvidiousPlaylist,
    InvidiousVideo,
    PipedChannel,
    PipedPlaylist,
    PipedVideo,
    extractInvidiousChannels,
    extractInvidiousPlaylists,
    extractInvidiousVideos,
    extractPipedChannel,
    extractPipedPlaylist,
    extractPipedVideos,
} from '@/utils/extractResults'

type InvidiousRes = InvidiousVideo | InvidiousPlaylist | InvidiousChannel
type PipedRes = PipedVideo | PipedPlaylist | PipedChannel

interface Res {
    continuation: Search | undefined | string
    data: SearchResult[]
}

// Main function for searching with invidious instance
async function searchInv(
    keyword: string,
    options: SearchOption,
    baseUrl: string
): Promise<Res | Error> {
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
                    return extractInvidiousVideos(item as InvidiousVideo)
                } else if (item.type === 'playlist') {
                    return extractInvidiousPlaylists(item as InvidiousPlaylist)
                } else if (item.type === 'channel') {
                    return extractInvidiousChannels(item as InvidiousChannel)
                } else {
                    return undefined
                }
            }
        )
        const data = searchResults.filter(
            (item) => item !== undefined
        ) as SearchResult[]
        return {
            data: data,
            continuation: undefined,
        }
    } catch (err) {
        return new Error(('invidious > ' + err) as string)
    }
}

async function searchInner(
    keyword: string,
    options: SearchOption,
    innertube: Innertube | null,
    nextpage: Search | undefined = undefined
): Promise<Res | Error> {
    try {
        if (innertube === null) {
            return new Error('innertube not found')
        }
        let res
        if (nextpage === undefined) {
            res = await innertube.search(keyword, {
                sort_by: options.sort_by as
                    | 'relevance'
                    | 'rating'
                    | 'upload_date'
                    | 'view_count',
                type: options.type as 'all' | 'video' | 'channel' | 'playlist',
            })
        } else {
            res = await nextpage.getContinuation()
        }
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
                    // console.log(item)
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
                        author: author.name.replace(/ · Playlist$/, ''),
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
        const data = searchResults.filter(
            (item) => item !== undefined
        ) as SearchResult[]
        return {
            continuation: res,
            data: data,
        }
    } catch (err) {
        return new Error(('innertube > ' + err) as string)
    }
}

async function searchPiped(
    keyword: string,
    options: SearchOption,
    baseUrl: string,
    nextpage = ''
) {
    try {
        const url =
            nextpage === ''
                ? new URL(baseUrl + '/search')
                : new URL(baseUrl + '/nextpage/search')
        if (nextpage !== '') {
            url.searchParams.set('nextpage', nextpage)
        }
        url.searchParams.set('q', keyword)
        url.searchParams.set('filter', options.type)
        const res = await fetch(url)
        const resJson = await res.json()
        // axios does not work for some reason
        // const res = await axios({
        //     method: 'get',
        //     baseURL: baseUrl,
        //     url: nextpage === '' ? 'search' : 'nextpage/search',
        //     params: {
        //         q: keyword,
        //         filter: options.type,
        //         nextpage: nextpage
        //     },
        //     paramsSerializer: (params) => {
        //         if (params.nextpage !== ''){
        //             const nextpage = JSON.parse(params.nextpage)
        //             console.log(nextpage)
        //             return `nextpage=${JSON.stringify(nextpage)}&q=${params.q}&filter=${params.filter}`
        //         } else {
        //             return `q=${params.q}&filter=${params.filter}`
        //         }
        //     },
        // })
        const searchResults: (SearchResult | undefined)[] = resJson.items.map(
            (item: PipedRes) => {
                if (item.type === 'stream') {
                    return extractPipedVideos(item as PipedVideo)
                } else if (item.type === 'playlist') {
                    return extractPipedPlaylist(item as PipedPlaylist)
                } else if (item.type === 'channel') {
                    return extractPipedChannel(item as PipedChannel)
                } else {
                    return undefined
                }
            }
        )
        const data = searchResults.filter(
            (item) => item !== undefined
        ) as SearchResult[]
        return {
            data: data,
            continuation: resJson.nextpage,
        }
    } catch (err) {
        return new Error(('piped > ' + err) as string)
    }
}

export async function handleSearchVideo(
    keyword: string,
    options: SearchOption,
    instances: Instance[],
    innertube: Innertube | null
): Promise<Res> {
    let res: Error | Res
    if (instances.length === 0) {
        throw new Error('error on handle search')
    }

    if (instances[0].enabled === false) {
        return await handleSearchVideo(
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
            break
        default:
            throw new Error('Unknown instance in handle Search')
    }
    if (res instanceof Error) {
        presentToast('error', 'search > ' + res.message)
        return await handleSearchVideo(
            keyword,
            options,
            instances.slice(1),
            innertube
        )
    }
    return res
}

export async function handleContinuation(
    options: SearchOption,
    continuation: SearchContinuation,
    instances: Instance[],
    innertube: Innertube | null
): Promise<Res> {
    let res: Res | Error
    try {
        if (continuation === undefined) {
            const invidious = instances.find(
                (item) => item.type === 'invidious'
            ) as Instance
            res = await searchInv(
                options.searchTerm,
                { ...options, page: options.page + 1 },
                invidious.url
            )
            if (res instanceof Error) {
                throw new Error('continuation > ' + res)
            }
        } else if (continuation.constructor.name === 'String') {
            const piped = instances.find(
                (item) => item.type === 'piped'
            ) as Instance
            res = await searchPiped(
                options.searchTerm,
                options,
                piped.url,
                continuation as string
            )
            if (res instanceof Error) {
                throw new Error('continuation > ' + res)
            }
        } else {
            res = await searchInner(
                options.searchTerm,
                options,
                innertube,
                continuation as Search
            )
            if (res instanceof Error) {
                throw new Error('continuation > ' + res)
            }
        }
        return res
    } catch (err) {
        presentToast('error', err as string)
        throw new Error(err as string)
    }
}
