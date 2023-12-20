import InstanceSetting from '@/views/Setting-modules/InstanceSetting'
import {
    selectConfig,
} from '@/store/globalConfig'
import {
    AccordionContent,
    Block,
    List,
    ListItem,
    Page,
    Toolbar,
} from 'framework7-react'
import React, { useEffect, type ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import UISetting from './Setting-modules/UISetting'
import StorageSetting from './Setting-modules/StorageSetting'

export interface SettingProps {}

export default function Setting(): ReactElement {
    const config = useSelector(selectConfig)
    const { t, i18n } = useTranslation(['common', 'setting'])
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
                            <UISetting />
                        </AccordionContent>
                    </ListItem>
                    <ListItem
                        className="text-xl"
                        accordionItem
                        accordionItemOpened
                        title={t('setting:Storage-Setting')}
                    >
                        <AccordionContent>
                            <StorageSetting />
                        </AccordionContent>
                    </ListItem>
                </List>
                <Toolbar bottom className="bg-transparent" />
            </Block>
        </Page>
    )
}
