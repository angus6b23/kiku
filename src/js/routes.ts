import ChannelView from "@/views/ChannelView";
import SearchResults from "@/views/SearchResults";
import TestPage from "@/views/TestPage";

const routes = [
    {
        path: '/',
        component: SearchResults
    },
    {
        path: '/test',
        component: TestPage
    },
    {
        path: '/channel/:channelId',
        component: ChannelView
    }

]

export default routes
