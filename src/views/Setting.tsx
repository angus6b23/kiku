import InstanceSetting from '@/components/InstanceSetting'
import { selectConfig, toggleTimeline } from '@/store/globalConfig'
import {
    AccordionContent,
    Block,
    BlockTitle,
    List,
    ListItem,
    Page,
} from 'framework7-react'
import React, { type ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'

export interface SettingProps {}

export default function Setting(): ReactElement {
    const config = useSelector(selectConfig)
    const dispatch = useDispatch()
    const { t } = useTranslation(['common', 'setting'])
    return (
        <Page name="setting">
            <Block>
                <List strong outlineIos dividersIos insetMd>
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
                                    {t('common:Now-Playing')}
                                    {t('common:Setting')}
                                </BlockTitle>
                                <List>
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
            </Block>
        </Page>
    )
}
