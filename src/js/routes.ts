import ChannelView from '@/views/ChannelView'
import PlaylistView from '@/views/PlaylistView'
import SearchResults from '@/views/SearchResults'
import TestPage from '@/views/TestPage'

const routes = [
    {
        path: '/',
        component: SearchResults,
    },
    {
        path: '/test',
        component: TestPage,
    },
    {
        path: '/channel/:channelId',
        component: ChannelView,
    },
    {
        path: '/playlist/:playlistId',
        component: PlaylistView,
    },
]

export default routes
