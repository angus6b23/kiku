import { shuffleAll, shuffleUnplayed } from '@/store/playlistReducers'
import { Button, Icon, List, ListItem, Popover, f7 } from 'framework7-react'
import React, { type ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'

export interface RandomButtonProps {}

export default function RandomButton(): ReactElement {
    const { t } = useTranslation()
    const dispatch = useDispatch()
    return (
        <>
            <Button
                popoverOpen=".random-popover"
                tooltip={t('playlist:Randomize-items')}
                className="m-0"
            >
                <Icon f7="shuffle" className="text-[1.5rem]"></Icon>
            </Button>
            <Popover className="random-popover" backdrop={false} arrow={false}>
                <List className="cursor-pointer">
                    <ListItem
                        onClick={() => dispatch(shuffleUnplayed())}
                        className="popover-close"
                    >
                        <Icon f7="music_note_list" />
                        <p>{t('playlist:Shuffle-unplayed-items')}</p>
                    </ListItem>
                    <ListItem
                        onClick={() => dispatch(shuffleAll())}
                        className="popover-close"
                    >
                        <Icon f7="question_diamond" />
                        <p>{t('playlist:Shuffle-all-items')}</p>
                    </ListItem>
                </List>
            </Popover>
        </>
    )
}
