import { changeAccentColor, selectConfig } from '@/store/globalConfig'
import {
    Block,
    BlockTitle,
    Icon,
    Link,
    List,
    ListInput,
    ListItem,
    NavRight,
    Navbar,
    Page,
    f7,
} from 'framework7-react'
import React, { type ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'

export interface AccentColorModalProps {}

export default function AccentColorModal(
    props: AccentColorModalProps
): ReactElement {
    const { t } = useTranslation(['storage'])
    const config = useSelector(selectConfig)
    const dispatch = useDispatch()
    const colors = Object.keys(f7.colors).filter(
        (c) => c !== 'primary' && c !== 'white' && c !== 'black'
    )
    const handlePrimaryColorChange = (color: string) => {
        dispatch(changeAccentColor(color))
    }
    return (
        <>
            <Page>
                <Navbar title={t('setting:Primary-color')}>
                    <NavRight>
                        <Link className="color-primary" popupClose>
                            <Icon f7="xmark" />
                        </Link>
                    </NavRight>
                </Navbar>
                <Block>
                    <BlockTitle>{t('setting:Choose-color')}</BlockTitle>
                    <div className="flex justify-around items-center gap-4 flex-wrap">
                        {colors.map((color) => {
                            const hex = f7.colors[color]
                            return (
                                <div
                                    key={color}
                                    className="h-20 w-20 rounded-md cursor-pointer"
                                    style={{ backgroundColor: hex }}
                                    onClick={() =>
                                        handlePrimaryColorChange(hex)
                                    }></div>
                            )
                        })}
                    </div>
                    <List strongIos outlineIos>
                        <ListInput
                            type="colorpicker"
                            label={t('setting:Color-hex')}
                            placeholder="e.g. #ff0000"
                            readonly
                            value={{ hex: config.ui.accentColor }}
                            onColorPickerChange={(value) =>
                                handlePrimaryColorChange(value.hex)
                            }
                            colorPickerParams={{
                                targetEl: '#color-theme-picker-color',
                            }}>
                            <div
                                slot="media"
                                id="color-theme-picker-color"
                                style={{
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '4px',
                                    background: 'var(--f7-theme-color)',
                                }}></div>
                        </ListInput>
                    </List>
                </Block>
            </Page>
        </>
    )
}
