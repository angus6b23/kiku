import axios from 'axios'
import { Search } from '../components/interfaces'
const apiBase = 'https://invidious.12a.app'
export async function searchInv(keyword: string, options: Search) {
    try {
        const res = await axios({
            method: 'get',
            baseURL: apiBase,
            url: '/api/v1/search',
            params: {
                q: keyword,
                page: options.page,
                sort_by: options.sort_by,
                type: options.type,
            },
        })
        return res.data
    } catch (err) {
        console.error(err)
        return []
    }
}
