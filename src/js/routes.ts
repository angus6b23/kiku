import ChannelView from '@/views/ChannelView'
import DetailView from '@/views/DetailView'
import PlaylistView from '@/views/PlaylistView'
import SearchResults from '@/views/SearchResults'
import TestPage from '@/views/TestPage'
import NoResult from '@/views/Search-modules/NoResult'

const routes = [
    {
        path: '/',
        component: NoResult,
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
    {
        path: '/search/:searchTerm',
        component: SearchResults
    }
]

export default routes
