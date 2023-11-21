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
import { useDispatch, useSelector } from 'react-redux'

export interface SettingProps {}

export default function Setting(): ReactElement {
    const config = useSelector(selectConfig)
    const dispatch = useDispatch()
    return (
        <Page name="setting">
            <Block>
                <BlockTitle className="text-2xl">Setting</BlockTitle>
                <List strong outlineIos dividersIos insetMd>
                    <ListItem
                        className="text-xl"
                        accordionItem
                        accordionItemOpened
                        title="Instance Configuration"
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
    )
}
