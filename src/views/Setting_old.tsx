import InstanceSetting from '@/components/InstanceSetting'
import presentToast from '@/components/Toast'
import { Instance } from '@/components/interfaces'
import { selectConfig, toggleTimeline } from '@/store/globalConfig'
import {
    AccordionContent,
    Block,
    BlockTitle,
    Icon,
    List,
    ListInput,
    ListItem,
    Page,
} from 'framework7-react'
import React, { useState, type ReactElement, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'

export interface SettingProps {}

export default function Setting(props: SettingProps): ReactElement {
    const config = useSelector(selectConfig)
    // const { t } = useTranslation(['setting', 'common'])
    const dispatch = useDispatch()

    return (
        <Suspense fallback="loading">

            <Page
                name="setting">
                <Block>
                    <BlockTitle className="text-2xl">
                        {/* {t('common:Setting')} */}
                    </BlockTitle>
                    <List strong outlineIos dividersIos insetMd>
                        <ListItem
                            className="text-xl"
                            accordionItem
                            accordionItemOpened
                            // title={t('setting:Instance-Configuration')}
                        >
                            <AccordionContent>
                                <InstanceSetting />
                            </AccordionContent>
                        </ListItem>
                        <ListItem
                            className="text-xl"
                            accordionItem
                            accordionItemOpened
                            title="UI Settings"
                        >
                            <AccordionContent>
                                <Block className="p-6">
                                    <BlockTitle className="text-lg">
                                        Now Playing Settings
                                    </BlockTitle>
                                    <List>
                                        <ListItem>
                                            <h1 className="text-lg my-4">
                                                Choose Layout
                                            </h1>
                                            <p>test</p>
                                        </ListItem>
                                        <ListItem
                                            checkbox
                                            checked={config.ui.showTimeline}
                                            onChange={() =>
                                                dispatch(toggleTimeline())
                                            }
                                        >
                                            <h1 className="text-lg my-4">
                                                Show Timeline in wavesurfer
                                            </h1>
                                        </ListItem>
                                    </List>
                                </Block>
                            </AccordionContent>
                        </ListItem>
                    </List>
                </Block>
            </Page>
        </Suspense>
    )
}
