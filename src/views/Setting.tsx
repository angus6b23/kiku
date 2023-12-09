import InstanceSetting from '@/components/InstanceSetting'
import {
    changeLocale,
    changeNowPlaying,
    changeTheme,
    selectConfig,
    toggleTimeline,
} from '@/store/globalConfig'
import {
    AccordionContent,
    Block,
    BlockTitle,
    List,
    ListItem,
    Page,
    Toolbar,
} from 'framework7-react'
import React, { BaseSyntheticEvent, useEffect, type ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { supportedLngs } from '@/js/i18n'

export interface SettingProps {}

export default function Setting(): ReactElement {
    const config = useSelector(selectConfig)
    const dispatch = useDispatch()
    const { t, i18n } = useTranslation(['common', 'setting'])
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
    useEffect(() => {
        i18n.changeLanguage(config.ui.lang)
    }, [config.ui.lang])
    return (
        <Page name="setting">
            <Block>
                {/* Accordion List */}
                <List strong outlineIos dividersIos insetMd className="py-4">
                    {/* Instance Config Title */}
                    <ListItem
                        className="text-xl"
                        accordionItem
                        accordionItemOpened
                        title={t('setting:Instance-Configuration')}
                    >
                        {/* Instance Config Content */}
                        <AccordionContent>
                            <InstanceSetting />
                        </AccordionContent>
                    </ListItem>
                    {/* UI Config Title */}
                    <ListItem
                        className="text-xl"
                        accordionItem
                        accordionItemOpened
                        title={t('setting:UI-Preference')}
                    >
                        <AccordionContent>
                            {/* Global UI Block */}
                            <Block className="p-6">
                                <BlockTitle className="text-lg">
                                    {' '}
                                    {`${t('common:Global-UI')} ${t(
                                        'common:Setting'
                                    )}`}
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
                                            <option value="light">
                                                {t('setting:Light')}
                                            </option>
                                            <option value="dark">
                                                {t('setting:Dark')}
                                            </option>
                                        </select>
                                    </ListItem>
                                </List>
                            </Block>
                            {/* Now Playing Title */}
                            <Block className="p-6">
                                <BlockTitle className="text-lg">
                                    {`${t('common:Now-Playing')} ${t(
                                        'common:Setting'
                                    )}`}
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
                                            defaultValue={
                                                config.nowPlaying.seekDuration
                                            }
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
                                        <h1 className="text-lg my-4">
                                            {t('setting:Choose-Layout')}
                                        </h1>
                                    </ListItem>
                                    <ListItem
                                        checkbox
                                        checked={config.nowPlaying.showTimeline}
                                        onChange={() =>
                                            dispatch(toggleTimeline())
                                        }
                                    >
                                        <h1 className="text-lg my-4">
                                            {t(
                                                'setting:Show-Timeline-in-wavesurfer'
                                            )}
                                        </h1>
                                    </ListItem>
                                </List>
                            </Block>
                        </AccordionContent>
                    </ListItem>
                </List>
                <Toolbar bottom className="bg-transparent" />
            </Block>
        </Page>
    )
}
