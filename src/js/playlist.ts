import presentToast from "@/components/Toast"
import { Instance, Thumbnail, VideoResult } from "@/components/interfaces"
import {stringToNumber} from "@/utils/format"
import {extractInnertubeThumbnail, generatePipedThumbnail} from "@/utils/thumbnailExtract"
import axios from "axios"
import Innertube from "youtubei.js/agnostic"
import {PlaylistVideo} from "youtubei.js/dist/src/parser/nodes"

interface InvidiousRes {
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
    url: string
    title: string
    uploaderUrl: string
    duration: number
    views: number
    thumbnail: string
}
const playlistInner = async (id: string, innertube: Innertube | null) => {
    try{
        if (innertube === undefined || innertube === null ){
            throw new Error('Innertube is null or undefined')
        }
        let res = await innertube.getPlaylist(id)
        // console.log(res)
        let videos: PlaylistVideo[] = res.videos as PlaylistVideo[]
        while (res.has_continuation){
            res = await res.getContinuation();
            const additionalVideos: PlaylistVideo[] = res.videos as PlaylistVideo[]
            videos = [...videos,  ...additionalVideos]
        }
        const resArr: VideoResult[] = videos.map(video => {
            const run = video.video_info.runs as {text: string}[]
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
        return resArr
    }catch(err){
        return new Error('innertube > ' + err)
    }
}
const playlistInv = async (id: string, baseUrl: string) => {
    try{
        const res = await axios({
            method: 'get',
            baseURL: baseUrl,
            url: `api/v1/playlists/${id}`
        })
        const resVideos: VideoResult[] = res.data.videos.map((video: InvidiousRes) => {
            return {
                type: 'video',
                title: video.title as string,
                videoId: video.videoId as string,
                author: video.author,
                authorId: video.authorId,
                videoThumbnails: extractInnertubeThumbnail(video.videoThumbnails as Thumbnail[]),
                viewCount: 0,
                lengthSeconds: video.lengthSeconds as number,
            }
        })
        return resVideos

    } catch (err){
        throw new Error('invidious > ' + err)
    }
}
const playlistPiped = async (id: string, baseUrl: string) => {
    try{
        const res = await axios({
            method: 'get',
            baseURL: baseUrl,
            url: `playlists/${id}`
        })
        const uploaderName = res.data.uploader as string
        let videos: PipedRes[] = res.data.relatedStreams 
        let nextPage = res.data.nextpage
        while(nextPage !== null){
            const url = new URL(`${baseUrl}/nextpage/playlists/${id}`)
            url.searchParams.set('nextpage', nextPage)
            const continuationRes = await fetch(url)
            const resJson = await continuationRes.json()
            videos = [...videos, ...resJson.relatedStreams as PipedRes[]]
            nextPage = resJson.nextpage
        }
        const resVideos: VideoResult[] = videos.map(video => {
            return {
                type: 'video',
                title: video.title as string,
                videoId: video.url.replace(/\/watch\?v=/, ''),
                author: uploaderName,
                authorId: video.uploaderUrl.replace(/\/channel\//, ''),
                videoThumbnails: generatePipedThumbnail(video.thumbnail),
                viewCount: video.views,
                lengthSeconds: video.duration,
            }
        })
        console.log(resVideos)
        return resVideos
    } catch (err){
        throw new Error('piped > ' + err)
    }
}
export async function handleGetPlaylist(
    id: string,
    instances: Instance[],
    innertube: Innertube | null
): Promise<VideoResult[]> {
    let res: Error | VideoResult[]
    if (instances.length === 0) {
        throw new Error('error on handle search')
    }

    if (instances[0].enabled === false) {
        return await handleGetPlaylist(
            id,
            instances.slice(1),
            innertube
        )
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
        return await handleGetPlaylist(
            id,
            instances.slice(1),
            innertube
        )
    }
    return res
}
