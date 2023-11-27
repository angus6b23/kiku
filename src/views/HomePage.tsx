import MainNav from '@/components/MainNav'
import React, { useState, type ReactElement } from 'react'
import { Block, Tabs, Tab, View, Toolbar } from 'framework7-react'
import ToolbarPlayer from '@/components/ToolbarPlayer'
import NowPlaying from './NowPlaying'
import Setting from './Setting'
import { useSelector } from 'react-redux'
import { selectPlayer } from '@/store/playerReducers'

export interface HomePageProps {}

export default function HomePage(props: HomePageProps): ReactElement {
    const [tab, setTab] = useState('main')
    const playerState = useSelector(selectPlayer)
    return (
        <>
            <MainNav tab={tab} setTab={setTab} />
            <Block className="mt-28 h-full mx-0 px-0">
                <Tabs>
                    <Tab tabActive={tab === 'now-playing'}>
                        <NowPlaying />
                    </Tab>
                    <Tab tabActive={tab === 'main'}>
                        <View id="page-router" url="/" className="h-page"></View>
                    </Tab>
                    <Tab tabActive={tab === 'setting'}>
                        <Setting />
                    </Tab>
                </Tabs>
            </Block>
            {tab !== 'now-playing' &&
                playerState.currentPlaying !== undefined && (
                    <Toolbar bottom>
                        <ToolbarPlayer
                            showNowPlaying={() => setTab('now-playing')}
                        />
                    </Toolbar>
                )}
        </>
    )
}
