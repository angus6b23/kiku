import React, {
    useState,
    type ReactElement,
    useEffect,
    useRef,
    BaseSyntheticEvent,
} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
    selectConfig,
    updateInstance,
    updateInstancei18n,
} from '@/store/globalConfig'
import { Instance } from '@/typescript/interfaces'
import {
    Block,
    List,
    ListItem,
    BlockTitle,
    f7,
    Button,
    Icon,
} from 'framework7-react'
import { useTranslation } from 'react-i18next'
import { Store, useCustomContext } from '@/store/reactContext'
import Innertube from 'youtubei.js/agnostic'
import { ytLangs, ytRegions } from '@/js/youtubei18n'
/* eslint @typescript-eslint/no-var-requires: 'off' */
const shell = require('electron').shell // To open link in external browser

export interface InstanceSettingProps {}

export default function InstanceSetting(): ReactElement {
    const config = useSelector(selectConfig)
    const invAutocomplete = useRef<any>(null) // For holding autocomplete for invidious instances
    const pipedAutocomplete = useRef<any>(null) // For holding autocomplete for piped instances
    const { t } = useTranslation(['setting'])
    const [instances, setInstances] = useState<Instance[]>(
        config.instance.preferType
    )
    const {
        instanceList,
    }: {
        instanceList: Instance[]
        innertube: React.RefObject<Innertube | null>
    } = useCustomContext(Store)

    const dispatch = useDispatch()

    const handleInstanceCheck = (instance: Instance) => {
        // For handling Enabling or disabling the instance via checkbox
        setInstances((state) => {
            return state.map((item) =>
                item.type === instance.type
                    ? { ...item, enabled: !item.enabled }
                    : item
            )
        })
    }
    const handleUrlChange = (newUrl: string, instanceType: string) => {
        // For handling the change of url of instances
        setInstances((state) => {
            return state.map((item) =>
                item.type === instanceType ? { ...item, url: newUrl } : item
            )
        })
    }
    const handleInstanceSort = (e: { to: number; from: number }) => {
        // For handling the dragging and dropping of instance
        const stateClone = [...instances]
        stateClone.splice(e.to, 0, ...stateClone.splice(e.from, 1))
        setInstances(stateClone)
    }
    const handlei18nChange = (e: BaseSyntheticEvent) => {
        if (e.target.name === 'yt-lang') {
            dispatch(
                updateInstancei18n({ type: 'lang', value: e.target.value })
            )
        } else if (e.target.name === 'yt-region') {
            dispatch(
                updateInstancei18n({ type: 'location', value: e.target.value })
            )
        }
    }
    const resetInstances = () => {
        // Reset the default settings when reset button is pressed
        setInstances([
            { type: 'local', url: '', enabled: true },
            {
                type: 'invidious',
                url: 'https://invidious.fdn.fr',
                enabled: true,
            },
            {
                type: 'piped',
                url: 'https://pipedapi.kavin.rocks',
                enabled: true,
            },
        ])
    }

    const autoCompletefx = (source: string[]) => {
        // Return a function which takes query: string, render: void function, used for source in creating autocomplete
        return (query: string, render: (items: any[]) => void) => {
            if (query.length === 0) {
                render([])
            } else {
                const res = source.filter((sourceItem) =>
                    sourceItem.toLowerCase().includes(query.toLowerCase())
                )
                render(res)
            }
        }
    }
    useEffect(() => {
        // Create autocompletes when instance list download is ready
        invAutocomplete.current = f7.autocomplete.create({
            inputEl: '#autocomplete-invidious',
            openIn: 'dropdown',
            source: autoCompletefx(
                instanceList
                    .filter((item) => item.type === 'invidious')
                    .map((item) => item.url)
            ),
            on: {
                change: (e) => {
                    handleUrlChange(e[0], 'invidious')
                },
            },
        })

        pipedAutocomplete.current = f7.autocomplete.create({
            inputEl: '#autocomplete-piped',
            openIn: 'dropdown',
            source: autoCompletefx(
                instanceList
                    .filter((item) => item.type === 'piped')
                    .map((item) => item.url)
            ),
            on: {
                change: (e) => {
                    handleUrlChange(e[0], 'piped')
                },
            },
        })
        // getInvInstances()
        // .then((res: string[] | Error) => {
        //     if (res instanceof Error) {
        //         throw res
        //     }
        //     invAutocomplete.current = f7.autocomplete.create({
        //         inputEl: '#autocomplete-invidious',
        //         openIn: 'dropdown',
        //         source: autoCompletefx(res),
        //         on: {
        //             change: (e) => {
        //                 handleUrlChange(e[0], 'invidious')
        //             },
        //         },
        //     })
        // })
        // .catch((err) => {
        //     presentToast('error', err)
        // })
        // getPipedInstances()
        // .then((res: string[] | Error) => {
        //     if (res instanceof Error) {
        //         throw res
        //     }
        //     pipedAutocomplete.current = f7.autocomplete.create({
        //         inputEl: '#autocomplete-piped',
        //         openIn: 'dropdown',
        //         source: autoCompletefx(res),
        //         on: {
        //             change: (e) => {
        //                 handleUrlChange(e[0], 'piped')
        //             },
        //         },
        //     })
        // })
        // .catch((err) => {
        //     presentToast('error', err)
        // })
        return () => {
            invAutocomplete.current.destroy()
            pipedAutocomplete.current.destroy()
        }
    }, [instanceList])

    useEffect(() => {
        // Watch for changes on instances, dispatch when changed
        dispatch(updateInstance(instances))
    }, [instances])
    return (
        <>
            <Block className="p-6">
                {/* Title here */}
                <BlockTitle className="text-lg">
                    {t('setting:Source')}
                </BlockTitle>
                {/* Draggable list here */}
                <List
                    sortable
                    sortableEnabled
                    dividers
                    onSortableSort={handleInstanceSort}
                >
                    {instances.map((instance) => {
                        return (
                            <ListItem
                                key={instance.type}
                                checkbox
                                checked={instance.enabled}
                                onChange={() => handleInstanceCheck(instance)}
                            >
                                <div>
                                    {/* Instance Type indicator */}
                                    <p>{instance.type}</p>
                                    {/* Url input for instance */}
                                    {instance.type !== 'local' && (
                                        <div>
                                            <label>{t('common:URL')}</label>
                                            <input
                                                type="options"
                                                className="ml-2 bg-transparent border-b-[1px] border-[--f7-md-on-surface] text-[--f7-md-on-surface] focus:border-[--f7-theme-color] focus:border-b-2 w-50"
                                                spellCheck={false}
                                                placeholder="https://instance.url"
                                                value={instance.url}
                                                id={`autocomplete-${instance.type}`}
                                                onChange={(e) =>
                                                    handleUrlChange(
                                                        e.target.value,
                                                        instance.type
                                                    )
                                                }
                                            ></input>
                                        </div>
                                    )}
                                </div>
                            </ListItem>
                        )
                    })}
                </List>
                <List>
                    <ListItem
                        title={t('setting:Youtube-Language')}
                        smartSelect
                        smartSelectParams={{ openIn: 'popup' }}
                    >
                        <select
                            name="yt-lang"
                            defaultValue={config.instance.lang}
                            onChange={handlei18nChange}
                        >
                            {ytLangs.map((lang) => {
                                const intlLanguage = new Intl.DisplayNames(
                                    [config.ui.lang],
                                    { type: 'language' }
                                )
                                return (
                                    <option value={lang} key={lang}>
                                        {intlLanguage.of(lang)}
                                    </option>
                                )
                            })}
                        </select>
                    </ListItem>
                    <ListItem
                        title={t('setting:Youtube-Region')}
                        smartSelect
                        smartSelectParams={{ openIn: 'popup' }}
                    >
                        <select
                            name="yt-region"
                            defaultValue={config.instance.location}
                            onChange={handlei18nChange}
                        >
                            {ytRegions.map((region) => {
                                const intlRegion = new Intl.DisplayNames(
                                    [config.ui.lang],
                                    { type: 'region' }
                                )
                                return (
                                    <option value={region} key={region}>
                                        {intlRegion.of(region)}
                                    </option>
                                )
                            })}
                        </select>
                    </ListItem>
                </List>
            </Block>
            {/* Buttons here */}
            <Block className="p-10 flex flex-wrap justify-center items-center gap-10">
                <Button
                    fill
                    onClick={() =>
                        shell.openExternal('https://api.invidious.io/')
                    }
                >
                    <Icon
                        f7="arrow_up_right_square"
                        className="mr-2 text-[1.2rem]"
                    />
                    {t('setting:View-Invidious-Instances')}
                </Button>
                <Button
                    fill
                    onClick={() =>
                        shell.openExternal(
                            'https://github.com/TeamPiped/Piped/wiki/Instances'
                        )
                    }
                >
                    <Icon
                        f7="arrow_up_right_square"
                        className="mr-2 text-[1.2rem]"
                    />
                    {t('setting:View-Piped-Instances')}
                </Button>
                <Button fill onClick={resetInstances}>
                    <Icon
                        f7="arrow_counterclockwise"
                        className="mr-2 text-[1.2rem]"
                    />
                    {t('setting:Reset-to-default')}
                </Button>
            </Block>
        </>
    )
}
