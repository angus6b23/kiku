import presentToast from '@/components/Toast'
import { Instance, PlaylistResult, VideoResult } from '@/typescript/interfaces'
import Innertube from 'youtubei.js/agnostic'
import {
    C4TabbedHeader,
    GridPlaylist,
    Playlist,
    Video,
} from 'youtubei.js/dist/src/parser/nodes'
import { extractInnertubeThumbnail } from '@/utils/thumbnailExtract'
import { formatViewNumber, toSecond } from '@/utils/format'
import axios from 'axios'
import {
    Channel,
    ChannelListContinuation,
} from 'youtubei.js/dist/src/parser/youtube'
import { Author } from 'youtubei.js/dist/src/parser/misc'
import { ChannelData } from '@/typescript/interfaces'
import {
    extractInvidiousPlaylists,
    extractInvidiousVideos,
    extractPipedPlaylist,
    extractPipedVideos,
} from '@/utils/extractResults'
import { getInstanceLists } from '@/utils/storeAccess'

interface VideoContinuationRes {
    videos: VideoResult[]
    videoContinuation: undefined | string | ChannelListContinuation | Channel
}
interface PlaylistContinuationRes {
    playlists: PlaylistResult[]
    playlistContinuation: undefined | string | ChannelListContinuation | Channel
}

const channelInner = async (id: string, innertube: Innertube | null) => {
    // Fetch channel from inndertube
    if (innertube === null) {
        // Throw error if innertube is null
        return new Error('innertube is null')
    }
    try {
        const res = await innertube.getChannel(id)
        const channelRes = res as Channel
        const header = channelRes.header as C4TabbedHeader
        const author = header.author as Author
        const info = {
            // Extract channel information from innertube results
            name: channelRes.metadata.title as string,
            subscribers: header.subscribers?.text?.replace(
                / subscribers$/,
                ''
            ) as string,
            videoCount: Number(
                header.videos_count?.text?.replace(/ videos$/, '')
            ) as number,
        }
        const videoRes = res.has_videos
            ? await res.getVideos()
            : { videos: [], has_continuation: false }
        const videoArr: (VideoResult | undefined)[] = videoRes.videos.map(
            (video) => {
                const innerVideo = video as Video
                const viewMatch = innerVideo.view_count.text
                    ?.replaceAll(',', '')
                    .match(/\d+/) as string[]
                const viewNumber = viewMatch[0] as string
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
                        viewCount: Number(viewNumber),
                        lengthSeconds: toSecond(
                            innerVideo.duration?.text as string
                        ),
                    }
                } else {
                    return undefined
                }
            }
        )
        const playlistRes = res.has_playlists
            ? await res.getPlaylists()
            : { playlists: [], has_continuation: false }
        const playlist: PlaylistResult[] = playlistRes.playlists.map(
            (playlist) => {
                return {
                    type: 'playlist',
                    title: playlist.title.text as string,
                    playlistId: playlist.id,
                    author: author.name,
                    authorId: author.id,
                    playlistThumbnails: extractInnertubeThumbnail(
                        playlist.thumbnails
                    ),
                    vidCount: Number(playlist.video_count_short.text),
                }
            }
        )
        const videoHasContinuation = videoRes.has_continuation
        const playlistHasContinuation = playlistRes.has_continuation
        return {
            channelInfo: info,
            videos: videoArr.filter((item) => item !== undefined),
            playlists: playlist,
            videoContinuation: videoHasContinuation ? videoRes : undefined,
            playlistContinuation: playlistHasContinuation
                ? playlistRes
                : undefined,
        } as ChannelData
    } catch (err) {
        return new Error('innertube > ' + err)
    }
}

const channelInv = async (id: string, baseUrl: string) => {
    try {
        // Create 3 axios requests: Basic info, videos and playlist
        const basicAxios = axios({
            baseURL: baseUrl,
            url: `api/v1/channels/${id}`,
        })
        const videoAxios = axios({
            baseURL: baseUrl,
            url: `api/v1/channels/${id}/videos`,
            params: {
                sort_by: 'newest',
            },
        })
        const playlistAxios = axios({
            baseURL: baseUrl,
            url: `api/v1/channels/${id}/playlists`,
            params: {
                sort_by: 'newest',
            },
        })
        // Wait for all request to complete
        const [basicInfo, videoRes, playlistRes] = await Promise.all([
            basicAxios,
            videoAxios,
            playlistAxios,
        ])
        // Extract basic information of channel from results
        const info = {
            name: basicInfo.data.author as string,
            subscribers: formatViewNumber(basicInfo.data.subCount) as string,
            videoCount: basicInfo.data.latestVideos.length as number,
        }
        // Extract videos and playlist from results
        const videos: VideoResult[] = extractInvidiousVideos(
            videoRes.data.videos
        ) as VideoResult[]
        const playlists: PlaylistResult[] = extractInvidiousPlaylists(
            playlistRes.data.playlists
        ) as PlaylistResult[]
        return {
            channelInfo: info,
            videos: videos,
            playlists: playlists,
            videoContinuation: videoRes.data.continuation,
            playlistContinuation: playlistRes.data.continuation,
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
            name: data.name as string,
            subscribers: formatViewNumber(data.subscriberCount),
            videoCount: data.relatedStreams.length as number,
        }
        const pipedPlaylistUrl = new URL(`${baseUrl}/channels/tabs`)
        const tabData = data.tabs.find(
            (tab: { name: string; data: string }) => tab.name === 'playlists'
        )?.data
        pipedPlaylistUrl.searchParams.set('data', tabData)
        const pipedPlaylistRes = await fetch(pipedPlaylistUrl)
        const pipedPlaylist = await pipedPlaylistRes.json()
        const playlists: PlaylistResult[] = extractPipedPlaylist(
            pipedPlaylist.content
        ) as PlaylistResult[]

        let videos: VideoResult[] = extractPipedVideos(
            data.relatedStreams
        ) as VideoResult[]
        videos = videos.filter((item) => item !== undefined) as VideoResult[]
        return {
            channelInfo: info,
            videos: videos,
            playlists: playlists,
            videoContinuation:
                data.nextpage !== null ? data.nextpage : undefined,
            playlistContinuation:
                pipedPlaylist.nextpage !== null
                    ? pipedPlaylist.nextpage
                    : undefined,
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

const channelVideoContinuationInner = async (
    continuation: Channel | ChannelListContinuation,
    innertube: Innertube | null
) => {
    if (innertube === null) {
        return new Error('innertube is null')
    }
    try {
        const res = await continuation.getContinuation()
        const videos = res.videos as Video[]
        const videoArr: VideoResult[] = videos.map((video) => {
            return {
                type: 'video',
                title: video.title.text as string,
                videoId: video.id,
                author: 'N/A',
                authorId: 'N/A',
                videoThumbnails: extractInnertubeThumbnail(video.thumbnails),
                viewCount: Number(
                    video.view_count.text
                        ?.replace(/ views$/, '')
                        .replace(/,/g, '')
                ),
                lengthSeconds: video.duration.seconds,
            }
        })
        return {
            videos: videoArr,
            videoContinuation: res.has_continuation ? res : undefined,
        }
    } catch (err) {
        return new Error('innertube > ' + err)
    }
}

const channelPlaylistContinuationInner = async (
    continuation: Channel | ChannelListContinuation,
    innertube: Innertube | null
) => {
    if (innertube === null) {
        return new Error('innertube is null')
    }
    try {
        const res = await continuation.getContinuation()
        const playlists: PlaylistResult[] = res.playlists.map(
            (playlist: Playlist | GridPlaylist) => {
                return {
                    type: 'playlist',
                    title: playlist.title.text as string,
                    playlistId: playlist.id,
                    author: 'N/A',
                    authorId: 'N/A',
                    playlistThumbnails: extractInnertubeThumbnail(
                        playlist.thumbnails
                    ),
                    vidCount: Number(playlist.video_count_short.text),
                }
            }
        )
        return {
            playlists: playlists,
            playlistContinuation: res.has_continuation ? res : undefined,
        }
    } catch (err) {
        return new Error('innertube > ' + err)
    }
}

const channelContinuationInv = async (
    channelId: string,
    continuation: string,
    baseUrl: string,
    sortBy: string = 'newest',
    type: 'video' | 'playlist'
) => {
    try {
        const res = await axios({
            method: 'get',
            baseURL: baseUrl,
            url: `/api/v1/channel/${channelId}/videos`,
            params: {
                sort_by: sortBy,
                continuation: continuation,
            },
        })
        if (type === 'video') {
            const videos = extractInvidiousVideos(res.data.videos)
            return {
                videos: videos,
                videoCountinuation: res.data.continuation,
            }
        } else if (type === 'playlist') {
            const playlists = extractInvidiousPlaylists(res.data.playlists)
            return {
                playlists: playlists,
                playlistContinuation: res.data.continuation,
            }
        }
    } catch (err) {
        return new Error('invidious > ' + err)
    }
}

export const handleChannelContinuation = async (
    channelId: string,
    innertube: Innertube | null,
    continuation: Channel | string | ChannelListContinuation,
    type: 'video' | 'playlist'
) => {
    // Get instance list from redux and extract invidious, piped url
    const instances: Instance[] = getInstanceLists()
    const invidiousUrl = instances.find((item) => item.type === 'invidious')
        ?.url
    if (type === 'video') {
        let res: Error | VideoContinuationRes
        if (typeof continuation !== 'string') {
            // Check if continuation is string, both invidious and piped use string as continuation token
            res = await channelVideoContinuationInner(
                continuation as Channel | ChannelListContinuation,
                innertube
            )
        } else {
            res = (await channelContinuationInv(
                channelId,
                continuation as string,
                invidiousUrl as string,
                undefined,
                'video'
            )) as VideoContinuationRes | Error
        }
        // Check if result is error
        // Will not attempt to load with another instance since continuation varies between instance
        if (res instanceof Error) {
            return new Error('channel video continuation > ' + res)
        }
        return res
    } else if (type === 'playlist') {
        let res: Error | PlaylistContinuationRes
        if (typeof continuation !== 'string') {
            res = await channelPlaylistContinuationInner(
                continuation as Channel | ChannelListContinuation,
                innertube
            )
        } else {
            res = (await channelContinuationInv(
                channelId,
                continuation as string,
                invidiousUrl as string,
                undefined,
                'playlist'
            )) as PlaylistContinuationRes | Error
        }
        if (res instanceof Error) {
            return new Error('channel playlist continuation > ' + res)
        }
    } else {
        // Catch unknown continuation type
        return new Error('unknown type for continuation')
    }
}
