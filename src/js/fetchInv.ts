import { Playitem } from '../components/interfaces'
import axios from 'axios'

const apiBase = 'https://invidious.12a.app'

const fetchStreamData = async (item: Playitem) => {
    try {
        const res = await axios({
            method: 'get',
            baseURL: apiBase,
            url: `/api/v1/videos/${item.id}`,
        })
        const audios = res.data.adaptiveFormats.filter((format: any) => {
            return format.encoding === 'opus' || format.encoding === 'aac'
        })
        audios.forEach((audio: any) => {
            let weight = 0
            if (audio.encoding === 'opus') {
                weight += 0.5
            }
            if (audio.audioQuality.includes('HIGH')) {
                weight += 3
            } else if (audio.audioQuality.includes('MEDIUM')) {
                weight += 2
            } else {
                weight += 1
            }
            audio.weight = weight
        })
        const targetAudio = audios.reduce(
            (acc: any, cur: any) => {
                if (cur.weight > acc.weight) {
                    return cur
                }
                return acc
            },
            { weight: 0 }
        )
        return {
            url: targetAudio.url as string,
            type: targetAudio.type.replace(/;.*$/, '') as string,
        }
    } catch (err) {
        console.error(err)
        return ''
    }
}

const fetchStream = async (url: string) => {
    const res = await axios({
        responseType: 'blob',
        method: 'get',
        url: url,
        headers: { Range: 'bytes=0-' },
    })
    return res.data
}
export { fetchStreamData, fetchStream }
