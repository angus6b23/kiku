interface FreetubePlaylist {
    playlistName: string
    protected: boolean
    removeOnWatch?: boolean
    checked?: boolean
    videos: {
        author: string
        authorId: string
        description: string
        isLive: boolean
        published: string
        timeAdded: string
        title: string
        type: string
        videoId: string
        viewCount: number
    }[]
}

export type { FreetubePlaylist }
