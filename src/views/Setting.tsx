import { Block, BlockTitle } from 'framework7-react'
import React, { type ReactElement } from 'react'

export interface SettingProps {}

export default function Setting(props: SettingProps): ReactElement {
    return (
        <>
            <Block>
                <BlockTitle>Setting</BlockTitle>
            </Block>
        </>
    )
}
