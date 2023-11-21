import MainNav from '@/components/MainNav'
import React, { useState, type ReactElement } from 'react'
import { Block, Tabs, Tab, View, Page } from 'framework7-react'
import NowPlaying from './NowPlaying'
import Setting from './Setting'

export interface HomePageProps {}

export default function HomePage(props: HomePageProps): ReactElement {
    const [tab, setTab] = useState('main')
    return (
        <>
            <MainNav tab={tab} setTab={setTab} />
            <Block className="mt-28 h-full mx-0 px-0">
                <Tabs>
                    <Tab tabActive={tab === 'now-playing'}>
                        <NowPlaying />
                    </Tab>
                    <Tab tabActive={tab === 'main'}>
                        <View url="/" className="h-page"></View>
                    </Tab>
                    <Tab tabActive={tab === 'setting'}>
                        <Setting />
                    </Tab>
                </Tabs>
            </Block>
        </>
    )
}
