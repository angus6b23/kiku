import { Thumbnail } from '@/typescript/interfaces'
import { selectAuthorThumbnailInv } from '@/utils/thumbnailExtract'
import Innertube from 'youtubei.js/agnostic'
import { Channel } from 'youtubei.js/dist/src/parser/youtube'

export const channelThumbnailInner = async (
    channelId: string,
    innertube: Innertube
) => {
    const res = await innertube.getChannel(channelId)
    const channelRes = res as Channel
    const thumbnails = channelRes.metadata.avatar
    return selectAuthorThumbnailInv(thumbnails as Thumbnail[])
}
