import { Instance } from '@/typescript/interfaces'
import axios from 'axios'
import Innertube from 'youtubei.js/agnostic'
import {autoFallback} from './autoFallback'

export async function suggestInv(
    keyword: string,
    baseUrl: string
): Promise<string[] | Error> {
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
        return new Error('Invidious suggestion error')
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
): Promise<string[] | Error> {
    return await autoFallback(keyword, suggestInner, suggestInv, suggestPiped, instances, innertube as Innertube, 'Search auto-suggest')
}
