import { Thumbnail } from '@/components/interfaces'

// Helper functions for extracting thumbnails for different api / innertube
export const extractInnertubeThumbnail = (
    array: { url: string; width: number; height: number }[]
) => {
    const maxresThumbnail: Thumbnail = {
        quality: 'maxres',
        url: array[0].url,
        height: array[0].height,
        width: array[0].width,
    }
    const mediumThumbnail: Thumbnail = array[1]
        ? {
              quality: 'medium',
              url: array[1].url,
              height: array[1].height,
              width: array[1].width,
          }
        : { ...maxresThumbnail, quality: 'medium' }
    return [maxresThumbnail, mediumThumbnail]
}
export const extractInvidiousChannelThumbnail = (
    array: { url: string; width: number; height: number }[]
) => {
    const thumbnails = array.sort((a, b) => b.width - a.width)
    return thumbnails.map((state, index) =>
        index === 0
            ? { ...state, quality: 'maxres' }
            : index === 1
            ? { ...state, quality: 'medium' }
            : { ...state, quality: '' }
    )
}
export const generatePipedThumbnail = (url: string) => {
    const img = new Image()
    img.src = url
    const thumbnail = {
        width: img.width,
        height: img.height,
        url: url,
    }
    return [
        { ...thumbnail, quality: 'maxres' },
        { ...thumbnail, quality: 'medium' },
    ]
}
