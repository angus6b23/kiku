import React, { useState, type ReactElement, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectConfig, updateInstance } from '@/store/globalConfig'
import { Instance } from './interfaces'
import { Block, List, ListItem, BlockTitle, f7, Button } from 'framework7-react'
import { useTranslation } from 'react-i18next'
import { Store, useCustomContext } from './context'
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
    const { instanceList }: { instanceList: Instance[] } =
        useCustomContext(Store)

    const dispatch = useDispatch()

    const handleInstanceCheck = (instance: Instance) => { // For handling Enabling or disabling the instance via checkbox
        setInstances((state) => {
            return state.map((item) =>
                item.type === instance.type
                    ? { ...item, enabled: !item.enabled }
                    : item
            )
        })
    }
    const handleUrlChange = (newUrl: string, instanceType: string) => { // For handling the change of url of instances
        setInstances((state) => {
            return state.map((item) =>
                item.type === instanceType ? { ...item, url: newUrl } : item
            )
        })
    }
    const handleInstanceSort = (e: { to: number; from: number }) => { // For handling the dragging and dropping of instance
        const stateClone = [...instances]
        stateClone.splice(e.to, 0, ...stateClone.splice(e.from, 1))
        setInstances(stateClone)
    }
    const resetInstances = () => { // Reset the default settings when reset button is pressed
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
    useEffect(() => { // Create autocompletes when instance list download is ready
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
            </Block>
            {/* Buttons here */}
            <Block className="p-10 flex flex-wrap justify-center items-center gap-10">
                <Button
                    fill
                    onClick={() =>
                        shell.openExternal('https://api.invidious.io/')
                    }
                >
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
                    {t('setting:View-Piped-Instances')}
                </Button>
                <Button fill onClick={resetInstances}>
                    {t('setting:Reset-to-default')}
                </Button>
            </Block>
        </>
    )
}
