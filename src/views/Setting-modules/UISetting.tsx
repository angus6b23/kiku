import React, { BaseSyntheticEvent, type ReactElement } from 'react'
import { Block, BlockTitle, List, ListItem, Popup } from 'framework7-react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import clsx from 'clsx'
import {
    changeLayout,
    changeLocale,
    changeNowPlaying,
    changeTheme,
    selectConfig,
    toggleHideOnClose,
    toggleTimeline,
} from '@/store/globalConfig'
import { supportedLngs } from '@/js/i18n'
import AccentColorModal from './AccentColorModal'

export default function UISetting(): ReactElement {
    const { t } = useTranslation(['setting'])
    const config = useSelector(selectConfig)
    const dispatch = useDispatch()
    const languageOptions = () => {
        // Grab list of supported languages then ouput list of option while displaying the language option in corresponding language
        return supportedLngs.map((lang) => {
            const langCode = Intl.getCanonicalLocales(lang)
            const languageName = new Intl.DisplayNames([langCode], {
                type: 'language',
            })
            return (
                <option value={lang} key={lang}>
                    {languageName.of(lang)}
                </option>
            )
        })
    }
    const handleLocaleChange = (e: BaseSyntheticEvent) => {
        dispatch(changeLocale(e.target.value))
    }
    const handleThemeChange = (e: BaseSyntheticEvent) => {
        dispatch(changeTheme(e.target.value))
    }
    const handleNowPlayingChange = (e: BaseSyntheticEvent) => {
        dispatch(
            changeNowPlaying({ key: e.target.name, value: e.target.value })
        )
    }
    const handleToggleHideOnClose = () => {
        dispatch(toggleHideOnClose())
    }
    const handleChangeLayout = (name: 'classic' | 'large-background') => {
        dispatch(changeLayout(name))
    }
    return (
        <>
            <Block className="p-6">
                <BlockTitle className="text-lg">
                    {`${t('common:Global-UI')} ${t('common:Setting')}`}
                </BlockTitle>
                <List>
                    {/* Language option item */}
                    <ListItem
                        title={t('setting:Language')}
                        smartSelect
                        smartSelectParams={{ openIn: 'popup' }}
                    >
                        <select
                            name="language"
                            defaultValue={config.ui.lang}
                            onChange={handleLocaleChange}
                        >
                            {languageOptions()}
                        </select>
                    </ListItem>
                    <ListItem
                        smartSelect
                        smartSelectParams={{ openIn: 'sheet' }}
                        title={t('setting:Theme')}
                    >
                        <select
                            name="theme"
                            defaultValue={config.ui.theme}
                            onChange={handleThemeChange}
                        >
                            <option value="light">{t('setting:Light')}</option>
                            <option value="dark">{t('setting:Dark')}</option>
                        </select>
                    </ListItem>
                    <ListItem
                        link
                        popupOpen=".accent-modal"
                        title={t('setting:Primary-color')}
                    >
                        <div className="flex gap-2 items-center">
                            <div
                                className="w-8 h-8 rounded-md"
                                style={{
                                    backgroundColor: config.ui.accentColor,
                                }}
                            ></div>
                            <p>{config.ui.accentColor}</p>
                        </div>
                    </ListItem>
                    <ListItem
                        checkbox
                        checked={config.ui.hideOnClose}
                        title={t('setting:Minimize-to-tray-when-closed')}
                        onChange={handleToggleHideOnClose}
                    />
                </List>
            </Block>
            {/* Now Playing Title */}
            <Block className="p-6">
                <BlockTitle className="text-lg">
                    {`${t('common:Now-Playing')} ${t('common:Setting')}`}
                </BlockTitle>
                {/* Now Playing Content */}
                <List>
                    {/* Seek time setting */}
                    <ListItem
                        title={t('setting:Seek-Time')}
                        smartSelect
                        smartSelectParams={{ openIn: 'popup' }}
                    >
                        <select
                            name="seekDuration"
                            defaultValue={config.nowPlaying.seekDuration}
                            onChange={handleNowPlayingChange}
                        >
                            <option value={10}>10</option>
                            <option value={15}>15</option>
                            <option value={30}>30</option>
                            <option value={45}>45</option>
                            <option value={60}>60</option>
                        </select>
                    </ListItem>
                    <ListItem>
                        <div>
                            <h1 className="text-lg my-4">
                                {t('setting:Choose-Layout')}
                            </h1>
                            <div className="grid grid-cols-2 gap-2">
                                <div
                                    className={clsx(
                                        'py-4 px-6 flex flex-wrap cursor-pointer',
                                        {
                                            'bg-[var(--f7-theme-color)]':
                                                config.nowPlaying.layout ===
                                                'classic',
                                        }
                                    )}
                                    onClick={() =>
                                        handleChangeLayout('classic')
                                    }
                                >
                                    <img
                                        className="w-full"
                                        src="/images/layout-classic.png"
                                    />
                                    <p
                                        className={clsx({
                                            'text-[var(--f7-md-surface)]':
                                                config.nowPlaying.layout ===
                                                'classic',
                                        })}
                                    >
                                        {t('setting:Classic')}
                                    </p>
                                </div>
                                <div
                                    className={clsx(
                                        'py-4 px-6 flex flex-wrap cursor-pointer',
                                        {
                                            'bg-[var(--f7-theme-color)]':
                                                config.nowPlaying.layout ===
                                                'large-background',
                                        }
                                    )}
                                    onClick={() =>
                                        handleChangeLayout('large-background')
                                    }
                                >
                                    <img
                                        className="w-full object-contain"
                                        src="/images/layout-bg.png"
                                    />
                                    <p
                                        className={clsx({
                                            'text-[var(--f7-md-surface)]':
                                                config.nowPlaying.layout ===
                                                'large-background',
                                        })}
                                    >
                                        {t('setting:Large-Background')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </ListItem>
                    <ListItem
                        checkbox
                        checked={config.nowPlaying.showTimeline}
                        onChange={() => dispatch(toggleTimeline())}
                    >
                        <h1 className="text-lg my-4">
                            {t('setting:Show-Timeline-in-wavesurfer')}
                        </h1>
                    </ListItem>
                </List>
            </Block>
            <Popup className="accent-modal">
                <AccentColorModal />
            </Popup>
        </>
    )
}
