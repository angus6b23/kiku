import { Instance, PlaylistResult, VideoResult } from '@/typescript/interfaces'
import Innertube from 'youtubei.js/agnostic'
import {
    C4TabbedHeader,
    GridPlaylist,
    Playlist,
    Video,
} from 'youtubei.js/dist/src/parser/nodes'
import { extractInnertubeThumbnail } from '@/utils/thumbnailExtract'
import { extractNumber, formatViewNumber, toSecond } from '@/utils/format'
import axios from 'axios'
import {
    Channel,
    ChannelListContinuation,
} from 'youtubei.js/dist/src/parser/youtube'
import { Author } from 'youtubei.js/dist/src/parser/misc'
import { ChannelData } from '@/typescript/interfaces'
import {
    PipedPlaylist,
    PipedVideo,
    extractInvidiousPlaylists,
    extractInvidiousVideos,
    extractPipedPlaylist,
    extractPipedVideos,
} from '@/utils/extractResults'
import { getInstanceLists } from '@/utils/storeAccess'
import { autoFallback } from './autoFallback'

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
                        viewCount: extractNumber(
                            innerVideo.view_count.text as string
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
): Promise<ChannelData | Error> {
    if (id === '') {
        return new Error('Channel id is empty')
    } else {
        return await autoFallback<ChannelData>(
            id,
            channelInner,
            channelInv,
            channelPiped,
            instances,
            innertube as Innertube,
            'Get Channel'
        )
    }
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
                viewCount: extractNumber(video.view_count.text as string),
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
            url: `/api/v1/channels/${channelId}/videos`,
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
const channelContinuationPiped = async (
    channelId: string,
    continuation: string,
    baseUrl: string
) => {
    try {
        const res = await axios({
            method: 'get',
            baseURL: baseUrl,
            url: `/nextpage/channel/${channelId}`,
            params: {
                nextpage: continuation,
            },
        })
        const pipedVideos = res.data.relatedStreams.filter(
            (item: PipedVideo) => item.type === 'stream'
        )
        const pipedPlaylist = res.data.relatedStreams.filter(
            (item: PipedPlaylist) => item.type === 'playlist'
        )
        return {
            videos: extractPipedVideos(pipedVideos),
            playlists: extractPipedPlaylist(pipedPlaylist),
            continuation: res.data.nextpage as string,
        }
    } catch (err) {
        return new Error('piped >' + err)
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
    const pipedUrl = instances.find((item) => item.type === 'piped')?.url
    if (type === 'video') {
        let res: Error | VideoContinuationRes
        if (typeof continuation !== 'string') {
            // Check if continuation is string, both invidious and piped use string as continuation token
            res = await channelVideoContinuationInner(
                continuation as Channel | ChannelListContinuation,
                innertube
            )
        } else {
            if (continuation.indexOf('{"url":"') === 0) {
                // piped nextpage starts with a json with an entry of url
                const pipedRes = await channelContinuationPiped(
                    channelId,
                    continuation,
                    pipedUrl as string
                )
                if (pipedRes instanceof Error) {
                    res = pipedRes as Error
                } else {
                    res = {
                        videos: pipedRes.videos,
                        videoContinuation: pipedRes.continuation as string,
                    } as VideoContinuationRes
                }
            } else {
                // invidious continuation
                res = (await channelContinuationInv(
                    channelId,
                    continuation as string,
                    invidiousUrl as string,
                    undefined,
                    'video'
                )) as VideoContinuationRes | Error
            }
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
            if (continuation.indexOf('{"url":"') === 0) {
                // piped nextpage starts with a json with an entry of url
                const pipedRes = await channelContinuationPiped(
                    channelId,
                    continuation,
                    pipedUrl as string
                )
                if (pipedRes instanceof Error) {
                    res = pipedRes as Error
                } else {
                    res = {
                        playlists: pipedRes.playlists,
                        playlistContinuation: pipedRes.continuation as string,
                    } as PlaylistContinuationRes
                }
            } else {
                // invidious continuation
                res = (await channelContinuationInv(
                    channelId,
                    continuation as string,
                    invidiousUrl as string,
                    undefined,
                    'playlist'
                )) as PlaylistContinuationRes | Error
            }
        }
        if (res instanceof Error) {
            return new Error('channel playlist continuation > ' + res)
        }
    } else {
        // Catch unknown continuation type
        return new Error('unknown type for continuation')
    }
}
