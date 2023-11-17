import React, { useState, type ReactElement } from "react"
import { Page } from "framework7-react"
import {useSelector} from "react-redux"
import {selectConfig} from "@/store/globalConfig"
import {useTranslation} from "react-i18next";

export interface testProps {
    
}

export default function TestPage(props: testProps): ReactElement {
    const config = useSelector(selectConfig);
    const { t } = useTranslation(['common'])
    return <Page>
        <p>{config.instance.preferType[0].type}</p>
        <p>{t('common:setting')}</p>
    </Page>
}
