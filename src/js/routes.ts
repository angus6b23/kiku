import ChannelView from '@/views/ChannelView'
import DetailView from '@/views/DetailView'
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
    {
        path: '/details/:videoId',
        component: DetailView,
    },
]

export default routes
