import {
    Channel,
    ChannelListContinuation,
    Search,
} from 'youtubei.js/dist/src/parser/youtube'

interface Playitem {
    id: string
    title: string
    streamUrl?: string
    audioFormat?: string
    duration: string
    downloadStatus: 'pending' | 'downloading' | 'downloaded' | 'error'
    status: 'added' | 'playing' | 'played'
    thumbnailURL: string
}

interface AudioBlobObject {
    id: string
    blob?: Blob
}

interface AudioBlobAction {
    type: 'ADD_BLOB' | 'REMOVE_BLOB'
    payload: AudioBlobObject
}

interface PlaylistAction {
    type:
        | 'ADD'
        | 'REMOVE'
        | 'SET_STREAM'
        | 'SET_BLOB'
        | 'SET_DOWNLOADING'
        | 'SET_PLAYING'
        | 'SET_ERROR'
        | 'PLAY_NEXT'
        | 'PLAY_PREV'
        | 'PLAY_RANDOM'
    payload: any
}

interface SearchOption {
    //Passed through options
    searchTerm: string
    page: number
    sort_by: 'relevance' | 'rating' | 'upload_date' | 'view_count'
    type: 'all' | 'video' | 'playlist' | 'channel'
    region?: string
}

interface SearchState {
    //Saved in store
    searchTerm: string
    page: number
    sort_by: 'relevance' | 'rating' | 'upload_date' | 'view_count'
    type: 'all' | 'video' | 'playlist' | 'channel'
    region: string
    results: SearchResult[]
}

type SearchContinuation = undefined | string | Search

interface SearchAction {
    type: 'INV_SEARCH' | 'LOAD_MORE' | 'NEW_SEARCH'
    payload: any
}

interface Thumbnail {
    quality: string
    url: string
    width: number
    height: number
}
interface VideoResult {
    type: 'video'
    title: string
    videoId: string
    author: string
    authorId: string
    videoThumbnails: Thumbnail[]
    viewCount: number
    lengthSeconds: number
}
interface ChannelResult {
    type: 'channel'
    author: string
    authorId: string
    channelThumbnails: Thumbnail[]
    subCount: string
}
interface PlaylistResult {
    type: 'playlist'
    title: string
    playlistId: string
    author: string
    authorId: string
    playlistThumbnails: Thumbnail[]
    vidCount: number
}
type SearchResult = VideoResult | PlaylistResult | ChannelResult
// interface SearchResult {
//     type: string
//     title: string
//     videoId: string
//     author: string
//     authorId: string
//     videoThumbnails: Thumbnail[]
//     description?: string
//     descriptionHtml?: string
//     viewCount: number
//     published?: number
//     publishedText?: string
//     lengthSeconds: number
//     liveNow?: boolean
//     paid?: boolean
//     premium?: boolean
// }
interface PlayerState {
    currentPlaying: Playitem | undefined
    status: 'stopped' | 'playing' | 'paused'
}

interface PlayerAction {
    type: 'TOGGLE_PLAY' | 'SELECT_SONG' | 'PLAY' | 'PAUSE'
    payload?: any
}

interface Instance {
    type: 'local' | 'invidious' | 'piped'
    url: string
    enabled: boolean
}

interface GlobalConfig {
    instance: {
        preferType: Instance[]
        lang: string
        location: string
    }
    ui: {
        lang: string
        accentColor: string
        showTimeline: boolean
        autoScroll: boolean
    }
}

interface ChannelData {
    channelInfo: {
        name: string
        // thumbnail: string
        subscribers: string
        videoCount: number
    }
    videoContinuation: undefined | Channel | string | ChannelListContinuation
    playlistContinuation: undefined | Channel | string | ChannelListContinuation
    videos: VideoResult[]
    playlists: PlaylistResult[]
}

interface PlaylistData {
    playlistInfo: {
        title: string
        videoCount: number
        authorId: string
        author: string
    }
    videos: VideoResult[]
}

type Continuation = Search | string | undefined

export type {
    SearchOption,
    SearchState,
    SearchContinuation,
    Thumbnail,
    VideoResult,
    ChannelResult,
    PlaylistResult,
    SearchResult,
    SearchAction,
    Playitem,
    PlaylistAction,
    PlayerState,
    PlayerAction,
    AudioBlobObject,
    AudioBlobAction,
    Instance,
    GlobalConfig,
    ChannelData,
    PlaylistData,
    Continuation,
}
