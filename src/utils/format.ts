import { store } from '@/store/store'

const formatViewNumber: (arg0: number) => string = (views) => {
    if (views > 1000000000) {
        return `${(views / 1000000000).toFixed(1)}B`
    } else if (views > 1000000) {
        return `${(views / 1000000).toFixed(1)}M`
    } else if (views > 1000) {
        return `${(views / 1000).toFixed(1)}K`
    } else {
        return views.toString()
    }
}
const convertSecond: (arg0: number) => string = (seconds) => {
    const hour: number = Number(Math.floor(seconds / 3600))
    const hourString: string =
        hour == 0 ? '' : `${hour.toString().padStart(2, '0')}:`
    const minute: number =
        hour > 0
            ? Number(Math.floor((seconds - 3600 * hour) / 60).toFixed())
            : Number(Math.floor(seconds / 60).toFixed())
    const minuteString: string =
        minute == 0 ? '00:' : `${minute.toString().padStart(2, '0')}:`
    const second = Math.floor(seconds % 60)
        .toString()
        .padStart(2, '0')
    return `${hourString}${minuteString}${second}`
}
const toSecond: (arg0: string) => number = (string) => {
    const splited = string.split(':').reverse()
    let secondCount = 0
    splited.forEach((item, index) => {
        secondCount += Number(item) * 60 ** index
    })
    return secondCount
}
const stringToNumber: (arg0: string) => number = (string) => {
    const modifier = string[string.length - 1]
    const number = Number(string.replace(/[^0-9.]/g, ''))
    if (modifier.match(/\d/)) {
        return number
    }
    if (isNaN(number)) {
        console.error('unable to extract number')
        return 0
    }
    switch (modifier) {
        case 'K':
            return number * 1000
        case 'k':
            return number * 1000
        case 'm':
            return number * 1000 * 1000
        case 'M':
            return number * 1000 * 1000
        case 'b':
            return number * 1000 * 1000 * 1000
        case 'B':
            return number * 1000 * 1000 * 1000
        default:
            console.error('unexpected modifier')
            return 0
    }
}
const compactNumber: (arg0: number) => string = (number) => {
    const storeState = store.getState()
    const lang = storeState.config.ui.lang
    const formatNumber = new Intl.NumberFormat(lang, {
        notation: 'compact',
    })
    return formatNumber.format(number)
}
const extractNumber: (arg0: string) => number = (string) => {
    const match = string.replaceAll(',', '').match(/\d+/) as string[]
    return Number(match[0])
}
export {
    formatViewNumber,
    convertSecond,
    toSecond,
    stringToNumber,
    compactNumber,
    extractNumber,
}
