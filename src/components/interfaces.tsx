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

interface Search {
    page: number
    sort_by: string
    type: string
    results: any[]
}

interface SearchState {
    searchTerm: string
    page: number
    sort_by: 'relevance' | 'rating' | 'upload_date' | 'view_count'
    type: 'all' | 'video' | 'playlist' | 'channel' | 'movie' | 'show'
    region: string
    results: SearchResult[]
}

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
interface SearchResult {
    type: string
    title: string
    videoId: string
    author: string
    videoThumbnails: Thumbnail[]
    description: string
    descriptionHtml: string
    viewCount: number
    published: number
    publishedText: string
    lengthSeconds: number
    liveNow: boolean
    paid: boolean
    premium: boolean
}
interface PlayerState {
    currentPlaying: Playitem | undefined
    status: 'stopped' | 'playing' | 'paused'
}
interface PlayerAction {
    type: 'TOGGLE_PLAY' | 'SELECT_SONG' | 'PLAY' | 'PAUSE'
    payload?: any
}
interface GlobalConfig {
    preferType: 'local' | 'Invidious' | 'Piped'
    invInstance: string
    pipedInstance: string
}
export {
    Search,
    SearchState,
    Thumbnail,
    SearchResult,
    SearchAction,
    Playitem,
    PlaylistAction,
    PlayerState,
    PlayerAction,
    AudioBlobObject,
    AudioBlobAction,
    GlobalConfig,
}
