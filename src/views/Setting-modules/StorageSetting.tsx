import React, { BaseSyntheticEvent, type ReactElement } from 'react'
import { List, ListItem } from 'framework7-react'
import { useDispatch, useSelector } from 'react-redux'
import {
    changeStorage,
    selectConfig,
    toggleBlobStorage,
} from '@/store/globalConfig'
import { useTranslation } from 'react-i18next'
import presentToast from '@/components/Toast'

export default function StorageSetting(): ReactElement {
    const config = useSelector(selectConfig)
    const dispatch = useDispatch()
    const { t } = useTranslation(['setting'])
    const handleStorageChange = (e: BaseSyntheticEvent) => {
        const size = Number(e.target.value)
        if (isNaN(size) || size < 0) {
            // Input validation
            presentToast(
                'error',
                t('setting:Storage-size-must-be-a-positive-number')
            )
        } else {
            dispatch(changeStorage(e.target.value))
        }
    }
    return (
        <>
            <List className="p-6">
                <ListItem
                    checkbox
                    checked={config.storage.enalbeBlobStorage}
                    onChange={() => dispatch(toggleBlobStorage())}
                >
                    {t('setting:Store-audio-files-on-disk')}
                </ListItem>
                <ListItem>
                    {t('setting:Maximum-audio-files-storage')}
                    <div>
                        <input
                            className="mr-2 w-16 bg-transparent border-b-[1px] border-[--f7-md-on-surface] text-[--f7-md-on-surface] focus:border-[--f7-theme-color] focus:border-b-2 w-50 text-center"
                            value={config.storage.blobStorageSize}
                            onChange={handleStorageChange}
                        ></input>
                        MB
                    </div>
                </ListItem>
            </List>
        </>
    )
}
