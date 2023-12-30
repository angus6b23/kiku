import React, { BaseSyntheticEvent, type ReactElement } from 'react'
import { Block, Button, Icon, List, ListItem, Popup } from 'framework7-react'
import { useDispatch, useSelector } from 'react-redux'
import {
    changeStorage,
    selectConfig,
    toggleBlobStorage,
} from '@/store/globalConfig'
import { useTranslation } from 'react-i18next'
import presentToast from '@/components/Toast'
import StorageManagement from './StorageManagement'
/* eslint-disable-next-line @typescript-eslint/no-var-requires */
const { shell, ipcRenderer } = require('electron')

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
    const handleOpenFolder = () => {
        ipcRenderer.invoke('get-folder-path').then((path: string) => {
            shell.openExternal(`file://${path}`)
        })
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
            <Block className="flex justify-center items-center gap-8">
                <Button fill onClick={handleOpenFolder}>
                    <Icon f7="folder_fill" className="mr-2 text-[1.2rem]" />
                    {t('setting:Show-stored-files')}
                </Button>
                <Button fill popupOpen=".storage-management-popup">
                    <Icon
                        f7="square_stack_3d_down_right_fill"
                        className="mr-2 text-[1.2rem]"
                    />
                    {t('setting:Manage-stored-files')}
                </Button>
            </Block>
            <Block className="h-20"></Block>
            <Popup className="storage-management-popup" tabletFullscreen={true}>
                <StorageManagement />
            </Popup>
        </>
    )
}
