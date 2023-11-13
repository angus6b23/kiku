import { Instance } from '@/components/interfaces'
import axios from 'axios'
import Innertube from 'youtubei.js/agnostic'

export async function suggestInv(
    keyword: string,
    baseUrl: string
): Promise<string[]> {
    // console.log('using invidious')
    if (keyword === '') return []
    try {
        const res = await axios({
            method: 'get',
            baseURL: baseUrl,
            url: 'api/v1/search/suggestions',
            params: {
                q: keyword,
            },
        })
        const rawSuggestions = res.data.suggestions
        const suggestions = rawSuggestions.map((suggestion: any) => {
            let result = suggestion
            const asciiMatch = [...suggestion.matchAll(/&#\d+;?/g)]
            asciiMatch.forEach((match) => {
                const char = String.fromCharCode(
                    match[0].replace('&#', '').replace(';', '')
                )
                result = result.replaceAll(match[0], char)
            })
            return result
        })
        return suggestions
    } catch (err) {
        console.error(err)
        return []
    }
}

export async function suggestInner(
    keyword: string,
    innertube: Innertube | null
): Promise<string[] | Error> {
    // console.log('using local')
    if (keyword === '') {
        return []
    }
    if (innertube === undefined || innertube === null) {
        return new Error('innertube not found')
    }
    try {
        return await innertube.getSearchSuggestions(keyword)
    } catch (err) {
        return new Error('innertube fetch failed')
    }
}
async function suggestPiped(keyword: string, url: string) {
    if (keyword === '') {
        return []
    }
    try {
        const res = await axios({
            baseURL: url,
            url: 'suggestions',
            params: {
                query: keyword,
            },
        })
        return res.data as string[]
    } catch (err) {
        console.error(err)
        return new Error('Piped suggestion error')
    }
}

export async function handleSuggest(
    keyword: string,
    instances: Instance[],
    innertube: Innertube | null
): Promise<string[]> {
    let res: string[] | Error
    if (instances.length === 0) {
        console.error('no more instances')
        return []
    }
    console.log(instances)
    if (instances[0].enabled === false) {
        return handleSuggest(keyword, instances.slice(1), innertube)
    }

    switch (instances[0].type) {
        case 'local':
            res = await suggestInner(keyword, innertube)
            break
        case 'invidious':
            res = await suggestInv(keyword, instances[0].url)
            break
        case 'piped':
            res = await suggestPiped(keyword, instances[0].url)
            break
        default:
            throw new Error('Unexpected switch in handleSuggest')
    }

    if (res instanceof Error) {
        console.error(res.message)
        return handleSuggest(keyword, instances.slice(1), innertube)
    } else {
        return res as string[]
    }
}
