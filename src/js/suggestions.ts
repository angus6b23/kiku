import axios from 'axios'
const apiBase = 'https://invidious.12a.app'
export async function suggestInv(keyword: string) {
    if (keyword === '') return []
    try {
        const res = await axios(
            `${apiBase}/api/v1/search/suggestions?q=${encodeURIComponent(
                keyword
            )}`
        )
        let rawSuggestions = res.data.suggestions
        let suggestions = rawSuggestions.map((suggestion) => {
            let result = suggestion
            const asciiMatch = [...suggestion.matchAll(/\&\#\d+;?/g)]
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
