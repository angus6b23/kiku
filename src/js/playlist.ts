import presentToast from '@/components/Toast'
import { Instance, PlaylistData, VideoResult } from '@/typescript/interfaces'
import {
    PipedVideo,
    extractInvidiousVideos,
    extractPipedVideos,
} from '@/utils/extractResults'
import { stringToNumber } from '@/utils/format'
import { extractInnertubeThumbnail } from '@/utils/thumbnailExtract'
import axios from 'axios'
import Innertube from 'youtubei.js/agnostic'
import { PlaylistVideo } from 'youtubei.js/dist/src/parser/nodes'

const playlistInner = async (id: string, innertube: Innertube | null) => {
    try {
        if (innertube === undefined || innertube === null) {
            throw new Error('Innertube is null or undefined')
        }
        let res = await innertube.getPlaylist(id)
        const playlistInfo = {
            title: res.info.title as string,
            videoCount: Number(res.info.total_items.replace(' videos', '')),
            authorId: res.info.author.id,
            author: res.info.author.name,
        }
        let videos: PlaylistVideo[] = res.videos as PlaylistVideo[]
        while (
            res.has_continuation &&
            videos.length < playlistInfo.videoCount
        ) {
            res = await res.getContinuation()
            const additionalVideos: PlaylistVideo[] =
                res.videos as PlaylistVideo[]
            videos = [...videos, ...additionalVideos]
        }
        const resArr: VideoResult[] = videos.map((video) => {
            const run = video.video_info.runs as { text: string }[]
            const viewString = run[0].text
            return {
                type: 'video',
                title: video.title.text as string,
                videoId: video.id,
                author: video.author.name as string,
                authorId: video.author.id as string,
                videoThumbnails: extractInnertubeThumbnail(video.thumbnails),
                viewCount: stringToNumber(viewString.replace(/ views$/, '')),
                lengthSeconds: video.duration.seconds,
            }
        })
        return {
            playlistInfo: playlistInfo,
            videos: resArr,
        }
    } catch (err) {
        return new Error('innertube > ' + err)
    }
}

const playlistInv = async (id: string, baseUrl: string) => {
    try {
        const res = await axios({
            method: 'get',
            baseURL: baseUrl,
            url: `api/v1/playlists/${id}`,
        })
        const playlistInfo = {
            title: res.data.title as string,
            videoCount: res.data.videoCount as number,
            authorId: res.data.authorId as string,
            author: res.data.author as string,
        }
        const resVideos: VideoResult[] = extractInvidiousVideos(
            res.data.videos
        ) as VideoResult[]
        console.log(resVideos)
        return {
            playlistInfo: playlistInfo,
            videos: resVideos,
        }
    } catch (err) {
        throw new Error('invidious > ' + err)
    }
}
const playlistPiped = async (id: string, baseUrl: string) => {
    try {
        const res = await axios({
            method: 'get',
            baseURL: baseUrl,
            url: `playlists/${id}`,
        })
        const playlistInfo = {
            title: res.data.name as string,
            videoCount: res.data.videos as number,
            authorId: res.data.uploaderUrl.replace('/channel/', '') as string,
            author: res.data.uploader as string,
        }
        let videos: PipedVideo[] = res.data.relatedStreams
        let nextPage = res.data.nextpage
        while (nextPage !== null) {
            const url = new URL(`${baseUrl}/nextpage/playlists/${id}`)
            url.searchParams.set('nextpage', nextPage)
            const continuationRes = await fetch(url)
            const resJson = await continuationRes.json()
            videos = [...videos, ...(resJson.relatedStreams as PipedVideo[])]
            nextPage = resJson.nextpage
        }
        const resVideos: VideoResult[] = extractPipedVideos(
            videos
        ) as VideoResult[]
        return {
            playlistInfo: playlistInfo,
            videos: resVideos,
        }
    } catch (err) {
        throw new Error('piped > ' + err)
    }
}

export async function handleGetPlaylist(
    id: string,
    instances: Instance[],
    innertube: Innertube | null
): Promise<PlaylistData> {
    let res: Error | PlaylistData
    if (instances.length === 0) {
        throw new Error('error on handle search')
    }

    if (instances[0].enabled === false) {
        return await handleGetPlaylist(id, instances.slice(1), innertube)
    }

    switch (instances[0].type) {
        case 'local':
            res = await playlistInner(id, innertube)
            break
        case 'invidious':
            res = await playlistInv(id, instances[0].url)
            break
        case 'piped':
            res = await playlistPiped(id, instances[0].url)
            break
        default:
            throw new Error('Unknown instance in handle Search')
    }
    if (res instanceof Error) {
        presentToast('error', 'get playlist > ' + res.message)
        return await handleGetPlaylist(id, instances.slice(1), innertube)
    }
    return res
}
