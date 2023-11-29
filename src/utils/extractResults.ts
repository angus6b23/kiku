import {PlaylistResult, Thumbnail, VideoResult} from "@/components/interfaces"
import {generatePipedThumbnail} from "./thumbnailExtract"

export interface InvidiousVideo{
    author: string
    authorId: string
    authorUrl: string
    authorVerified: boolean
    description: string
    descriptionHTML: string
    isUpcoming: boolean
    lengthSeconds: number
    liveNow: boolean
    premium: boolean
    published: number
    publishedText: string
    title: string
    type: "video"
    videoThumbnails: Thumbnail[]
    videoId: string
    viewCount: number
    viewCountText: string
}
export interface InvidiousPlaylist{
    author: string
    authorId: string
    authorThumbnails: {
        width: number
        height: number
        url: string
    }[]
    authorUrl: string
    description: string
    descriptionHTML: string
    isListed: boolean
    playlistId: string
    playlistThumbnail: string
    subtitle: string | null
    title: string
    type: "playlist"
    updated: number
    videoCount: number
    videos: Pick<InvidiousVideo, "author" | "authorId" | "authorUrl" | "lengthSeconds" | "title" | "videoId" | "videoThumbnails">[]
    viewCount: number
}
export function extractInvidiousVideos(videos: InvidiousVideo[]){
    return videos.map(video => {
        return {
            type: 'video',
            title: video.title,
            videoId: video.videoId,
            author: video.author,
            authorId: video.authorId,
            videoThumbnails: video.videoThumbnails,
            viewCount: video.viewCount,
            lengthSeconds: video.lengthSeconds
        } as VideoResult
    })
}
export function extractInvidiousPlaylists(playlists: InvidiousPlaylist[]){
    return playlists.map(playlist => {
        return {
            type: "playlist",
            title: playlist.title,
            playlistId: playlist.playlistId,
            author: playlist.author,
            authorId: playlist.authorId,
            playlistThumbnails: generatePipedThumbnail(playlist.playlistThumbnail),
            vidCount: playlist.videoCount
        } as PlaylistResult
    })
}
