import Innertube from 'youtubei.js/agnostic'
import { Instance } from '../components/interfaces'
import axios from 'axios'

interface PipedAudio {
    url: string
    quality: string
    mimeType: string
    weight: number
}

const fetchInfoInv = async (id: string, baseUrl: string, controller: AbortController) => {
    try {
        const res = await axios({
            method: 'get',
            baseURL: baseUrl,
            url: `api/v1/videos/${id}`,
            signal: controller.signal
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
        return await fetchStream(targetAudio.url as string, controller)
    } catch (err) {
        return new Error('unable to fetch info with invidious')
    }
}

const fetchInfoPiped = async (id: string, baseUrl: string, controller: AbortController) => {
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
        return await fetchStream(targetAudio.url, controller)
    } catch (err) {
        return new Error(err as string)
    }
}
const fetchInfoInner = async (id: string, innertube: Innertube | null, controller: AbortController) => {
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
        return await fetchStream(url, controller)
    } catch (err) {
        return new Error(err as string)
    }
}

const fetchStream = async (url: string, controller: AbortController) => {
    try {
        const TEN_MIB = 10 * 1024 * 1024
        const contentLength = Number(new URL(url).searchParams.get('clen')) //clen = content length
        if (contentLength < TEN_MIB) { // Directly download if content length is less than 10MB
            const res = await axios({
                responseType: 'blob',
                method: 'get',
                url: url,
                signal: controller.signal,
                headers: { Range: `bytes=0-${contentLength}` },
            })
            return res.data
        } else { // Split the clen into chunks of 10Mb then downloadm
            let start = 0
            const blobs = []
            while (start < contentLength && controller.signal.aborted === false ) { // Download until the starting byte is larger than content length
                const end = //Set End byte to start + 10Mb or content Length
                    start + TEN_MIB > contentLength
                        ? contentLength
                        : start + TEN_MIB
                        const res = await axios({
                            responseType: 'blob',
                            method: 'get',
                            url: url,
                            signal: controller.signal,
                            headers: { Range: `bytes=${start}-${end}` },
                        })
                        blobs.push(res.data)
                        start += TEN_MIB + 1
            }
            const type = blobs[0].type
            const data = blobs.reduce( // Combine all blobs into one blob
                                      (a, b) => new Blob([a, b], { type: type })
                                     )
                                     return data
        }
    } catch (err) {
        return new Error(err as string)
    }
}

export async function handleFetchStream(
    id: string,
    instances: Instance[],
    innertube: Innertube | null,
    controller: AbortController
): Promise<Blob | Error> {
    let res: Error | Blob
    if (instances.length === 0) {
        return new Error(`unable to fetch info from ${id}`)
    }
    if (instances[0].enabled === false) {
        return await handleFetchStream(id, instances.slice(1), innertube, controller)
    }
    switch (instances[0].type) {
        case 'invidious':
            res = await fetchInfoInv(id, instances[0].url, controller)
        break
        case 'piped':
            res = await fetchInfoPiped(id, instances[0].url, controller)
        break
        case 'local':
            res = await fetchInfoInner(id, innertube, controller)
        break
        default:
            throw new Error('unknown instance type in fetch info')
    }
    if (res instanceof Error) {
        if (controller.signal.aborted === false ){
            console.error(res)
            return await handleFetchStream(id, instances.slice(1), innertube, controller)
        }
    }
    return res
}
export { fetchStream }
