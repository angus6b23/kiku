import { Playitem } from '@/typescript/interfaces'

export const getNextSong: (arg0: Playitem[]) => Playitem | undefined = (
    playlist
) => {
    const currentSong = playlist.findIndex((item) => item.status === 'playing')
    let nextSong
    for (let i = currentSong + 1; i < playlist.length; i++) {
        if (playlist[i].downloadStatus === 'downloaded') {
            nextSong = playlist[i]
            break
        }
    }
    return nextSong
}

export const getPrevSong: (arg0: Playitem[]) => Playitem | undefined = (
    playlist
) => {
    const currentSong = playlist.findIndex((item) => item.status === 'playing')
    let prevSong
    for (let i = currentSong - 1; i >= 0; i--) {
        if (playlist[i].downloadStatus === 'downloaded') {
            prevSong = playlist[i]
            break
        }
    }
    return prevSong
}
