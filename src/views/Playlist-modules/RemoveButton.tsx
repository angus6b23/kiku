import { setSong, stop } from '@/store/playerReducers'
import {
    clearAllItems,
    clearErrorItems,
    clearPlayedItems,
} from '@/store/playlistReducers'
import { Button, Icon, List, ListItem, Popover, f7 } from 'framework7-react'
import React, { type ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'

export interface RemoveButtonProps {}

export default function RemoveButton(): ReactElement {
    const { t } = useTranslation()
    const dispatch = useDispatch()
    const handleClearPlaylist = () => {
        f7.dialog.confirm(
            t('playlist:Are-you-sure-to-clear-the-playlist'),
            t('playlist:Clear-playlist'),
            () => {
                dispatch(clearAllItems())
                dispatch(setSong(undefined))
                dispatch(stop())
            }
        )
    }
    return (
        <>
            <Button
                popoverOpen=".remove-popover"
                tooltip={t('playlist:Remove-Items')}
                className="m-0"
            >
                <Icon f7="trash" className="text-[1.5rem]"></Icon>
            </Button>
            <Popover className="remove-popover" backdrop={false} arrow={false}>
                <List className="cursor-pointer">
                    <ListItem
                        onClick={() => dispatch(clearErrorItems())}
                        className="popover-close"
                    >
                        <Icon f7="flag_slash" />
                        <p>{t('playlist:Clear-Error-items')}</p>
                    </ListItem>
                    <ListItem
                        onClick={() => dispatch(clearPlayedItems())}
                        className="popover-close"
                    >
                        <Icon f7="flowchart_fill" />
                        <p>{t('playlist:Clear-played-items')}</p>
                    </ListItem>
                    <ListItem
                        onClick={handleClearPlaylist}
                        className="popover-close"
                    >
                        <Icon f7="xmark" />
                        <p>{t('playlist:Clear-playlist')}</p>
                    </ListItem>
                </List>
            </Popover>
        </>
    )
}
