interface Playitem {
    id: string
    title: string
    streamUrl?: string
    audioBlob?: string
    audioFormat?: string
    duration: string
    downloadStatus: 'pending' | 'downloading' | 'downloaded'
    status: 'added' | 'playing' | 'played'
    thumbnailURL: string
}

interface PlaylistAction {
    type: 'ADD' | 'REMOVE' | 'SET_STREAM' | 'SET_BLOB' | 'SET_DOWNLOADING' | 'SET_PLAYING'
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
    type: 'INV_SEARCH' | 'LOAD_MORE'
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
    currentPlaying: Playitem | undefined,
    playing: boolean
}
interface PlayerAction {
    type: "TOGGLE_PLAY" | "NEXT" | "PREV" | "RANDOM_NEXT" | "SELECT_SONG",
    payload?: any;
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
    PlayerAction
}
