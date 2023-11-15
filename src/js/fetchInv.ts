import Innertube from 'youtubei.js/agnostic'
import { Instance } from '../components/interfaces'
import axios from 'axios'

interface PipedAudio {
    url: string
    quality: string
    mimeType: string
    weight: number
}

const fetchInfoInv = async (id: string, baseUrl: string) => {
    try {
        const res = await axios({
            method: 'get',
            baseURL: baseUrl,
            url: `api/v1/videos/${id}`,
        })
        // Filter out audios from adaptive formats
        const audios = res.data.adaptiveFormats.filter((format: any) => {
            return format.encoding === 'opus' || format.encoding === 'aac'
        })
        // Give weighting to each audio, prioritize quality, then prefer opus format
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
        // Select the audio with highest weighting
        const targetAudio = audios.reduce(
            (acc: any, cur: any) => {
                if (cur.weight > acc.weight) {
                    return cur
                }
                return acc
            },
            { weight: 0 }
        )
        return await fetchStream(targetAudio.url as string)
    } catch (err) {
        return new Error('unable to fetch info with invidious')
    }
}

const fetchInfoPiped = async (id: string, baseUrl: string) => {
    try {
        const res = await axios({
            method: 'get',
            baseURL: baseUrl,
            url: `streams/${id}`,
        })
        const audios: PipedAudio[] = res.data.audioStreams
        audios.forEach((audio) => {
            audio.weight = Number(audio.quality.replace(/ kbps$/, ''))
            audio.weight += audio.mimeType.includes('webm') ? 0.5 : 0
        })
        const targetAudio = audios.reduce(
            (acc: PipedAudio, cur: PipedAudio) => {
                if (cur.weight > acc.weight) {
                    return cur
                } else {
                    return acc
                }
            },
            { weight: 0 } as PipedAudio
        )
        if (
            targetAudio.url === undefined ||
            targetAudio.mimeType === undefined
        ) {
            throw new Error('no audio in piped')
        }
        return await fetchStream(targetAudio.url)
    } catch (err) {
        return new Error(err as string)
    }
}
const fetchInfoInner = async (id: string, innertube: Innertube | null) => {
    try {
        if (innertube === null) {
            return new Error('innertube is null')
        }
        const info = await innertube.getBasicInfo(id)
        const format = info.chooseFormat({ type: 'audio', quality: 'best' })
        const url = format.decipher(innertube.session.player)
        if (url === undefined) {
            throw new Error('url is undefined in innertube')
        }
        return await fetchStream(url)
    } catch (err) {
        return new Error(err as string)
    }
}

const fetchStream = async (url: string) => {
    try {
        const res = await axios({
            responseType: 'blob',
            method: 'get',
            url: url,
            headers: { Range: 'bytes=0-' },
        })
        return res.data
    } catch (err) {
        return new Error(err as string)
    }
}

export async function handleFetchStream(
    id: string,
    instances: Instance[],
    innertube: Innertube | null
): Promise<Blob | Error> {
    let res: Error | Blob
    if (instances.length === 0) {
        return new Error(`unable to fetch info from ${id}`)
    }
    if (instances[0].enabled === false) {
        return await handleFetchStream(id, instances.slice(1), innertube)
    }
    switch (instances[0].type) {
        case 'invidious':
            res = await fetchInfoInv(id, instances[0].url)
            break
        case 'piped':
            res = await fetchInfoPiped(id, instances[0].url)
            break
        case 'local':
            res = await fetchInfoInner(id, innertube)
            break
        default:
            throw new Error('unknown instance type in fetch info')
    }
    if (res instanceof Error) {
        console.error(res)
        return await handleFetchStream(id, instances.slice(1), innertube)
    }
    return res
}
export { fetchStream }
