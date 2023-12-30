import { Thumbnail } from '@/typescript/interfaces'

// Helper functions for extracting thumbnails for different api / innertube
export const extractInnertubeThumbnail = (
    array: { url: string; width: number; height: number }[]
) => {
    const maxresThumbnail: Thumbnail = {
        quality: 'maxres',
        url: fixChannelThumbnail(array[0].url),
        height: array[0].height,
        width: array[0].width,
    }
    const mediumThumbnail: Thumbnail = array[1]
        ? {
              quality: 'medium',
              url: fixChannelThumbnail(array[1].url),
              height: array[1].height,
              width: array[1].width,
          }
        : { ...maxresThumbnail, quality: 'medium' }
    return [maxresThumbnail, mediumThumbnail]
}
const fixChannelThumbnail = (string: string) => {
    // Sometimes invidious and innertube will pass a thumbnail with a url starts with // instead of https://
    return string.replace(/^\/\//, 'https://')
}
export const extractInvidiousChannelThumbnail = (
    array: { url: string; width: number; height: number }[]
) => {
    const thumbnails = array.sort((a, b) => b.width - a.width)
    return thumbnails.map((state, index) =>
        index === 0
            ? {
                  ...state,
                  quality: 'maxres',
                  url: fixChannelThumbnail(state.url),
              }
            : index === 1
              ? {
                    ...state,
                    quality: 'medium',
                    url: fixChannelThumbnail(state.url),
                }
              : { ...state, quality: '', url: fixChannelThumbnail(state.url) }
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
