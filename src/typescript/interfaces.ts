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

interface AbortControllerAction {
    type: 'ADD'
    payload: AbortController
}
interface AbortControllerObject {
    [key: string]: AbortController
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
    viewCount?: number
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
interface VideoDetails extends VideoResult {
    authorThumbnail: string
    description: string
    published: number
    keywords: string[]
    likeCount: number
    genre: string
    recommendedVideos: VideoResult[]
}
type SearchResult = VideoResult | PlaylistResult | ChannelResult

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
        theme: 'dark' | 'light'
        autoScroll: boolean
        hideOnClose: boolean
    }
    nowPlaying: {
        seekDuration: number
        showTimeline: boolean
        layout: 'classic' | 'large-background'
    }
    storage: {
        enalbeBlobStorage: boolean
        blobStorageSize: number
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

interface LocalBlobEntry {
    id: string
    extension: string
    title: string
    created: number
    lastAccess: number
}

interface LocalPlaylist {
    name: string
    id: string
    data: Playitem[]
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
    VideoDetails,
    SearchAction,
    Playitem,
    PlaylistAction,
    PlayerState,
    PlayerAction,
    AudioBlobObject,
    AudioBlobAction,
    AbortControllerAction,
    AbortControllerObject,
    Instance,
    GlobalConfig,
    ChannelData,
    PlaylistData,
    Continuation,
    LocalBlobEntry,
    LocalPlaylist,
}
