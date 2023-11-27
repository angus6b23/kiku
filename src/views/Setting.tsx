import InstanceSetting from '@/components/InstanceSetting'
import { changeLocale, selectConfig, toggleTimeline } from '@/store/globalConfig'
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
    useEffect(() => {
        i18n.changeLanguage(config.ui.lang)
    }, [config.ui.lang])
    return (
        <Page name="setting">
            <Block>
                <List strong outlineIos dividersIos insetMd className="py-4">
                    <ListItem
                        className="text-xl"
                        accordionItem
                        accordionItemOpened
                        title={t('setting:Instance-Configuration')}
                    >
                        <AccordionContent>
                            <InstanceSetting />
                        </AccordionContent>
                    </ListItem>
                    <ListItem
                        className="text-xl"
                        accordionItem
                        accordionItemOpened
                        title={t('setting:UI-Preference')}
                    >
                        <AccordionContent>
                            <Block className="p-6">
                                <BlockTitle className="text-lg">
                                    {`${t('common:Now-Playing')} ${t('common:Setting')}`}
                                </BlockTitle>
                                <List>
                                    <ListItem title={t('setting:Language')} smartSelect smartSelectParams={{openIn: 'sheet'}}>
                                        <select name="language" defaultValue={config.ui.lang} onChange={handleLocaleChange}>
                                        {
                                            supportedLngs.map(lang => {
                                                const langCode = Intl.getCanonicalLocales(lang);
                                                const languageName = new Intl.DisplayNames([langCode], { type: "language" })
                                                return <option value={lang} key={lang}>{languageName.of(lang)}</option>
                                            }
                                            )
                                        }
                                        </select>
                                    </ListItem>
                                    <ListItem>
                                        <h1 className="text-lg my-4">
                                            {t('setting:Choose-Layout')}
                                        </h1>
                                    </ListItem>
                                    <ListItem
                                        checkbox
                                        checked={config.ui.showTimeline}
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
