import MainNav from '@/components/MainNav'
import React, { useState, type ReactElement, useEffect } from 'react'
import { Block, Tabs, Tab, View, Toolbar, f7 } from 'framework7-react'
import ToolbarPlayer from '@/components/ToolbarPlayer'
import NowPlaying from './NowPlaying'
import Setting from './Setting'
import { useSelector } from 'react-redux'
import { selectPlayer } from '@/store/playerReducers'
import { selectConfig } from '@/store/globalConfig'

export interface HomePageProps {}

export default function HomePage(): ReactElement {
    const [tab, setTab] = useState('main')
    const playerState = useSelector(selectPlayer)
    const config = useSelector(selectConfig)
    // Add event listener for back hotkey
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.code === 'ArrowLeft' && e.altKey) {
                f7.views.get('#page-router').router.back()
                setTab('main')
            }
        }
        document.addEventListener('keydown', handleKeyPress)
        return () => document.removeEventListener('keydown', handleKeyPress)
    }, [])
    // Automatically switch to main tab when route change
    useEffect(() => {
        const routerListener = () => {
            setTab('main')
        }
        f7.views.get('#page-router').on('routeChange', routerListener)
        return () =>
            f7.views.get('#page-router').off('routeChange', routerListener)
    }, [])
    // Automatically set app color theme and accent color;
    useEffect(() => {
        f7.setDarkMode(config.ui.theme === 'dark')
        f7.setColorTheme(config.ui.accentColor)
    }, [config.ui.theme, config.ui.accentColor])
    return (
        <>
            <MainNav tab={tab} setTab={setTab} />
            <Block className="mt-28 h-full mx-0 px-0">
                <Tabs>
                    <Tab tabActive={tab === 'now-playing'}>
                        <NowPlaying />
                    </Tab>
                    <Tab tabActive={tab === 'main'}>
                        <View
                            id="page-router"
                            url="/"
                            className="h-page"></View>
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
