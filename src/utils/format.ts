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
    const second = (seconds % 60).toString().padStart(2, '0')
    return `${hourString}${minuteString}${second}`
}
const toSecond: (arg0: string) => number = (string) => {
    const splited = string.split(':').reverse();
    let secondCount = 0;
    splited.forEach((item, index) => {
        secondCount += Number(item) * (60 ** index)
    })
    return secondCount
}
export { formatViewNumber, convertSecond, toSecond}
