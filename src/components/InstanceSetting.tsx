import React, {
    useState,
    type ReactElement,
    ChangeEvent,
    useEffect,
} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { selectConfig, updateInstance } from '@/store/globalConfig'
import { Instance } from './interfaces'
import { Block, List, ListItem, BlockTitle } from 'framework7-react'

export interface InstanceSettingProps {}

export default function InstanceSetting(
    props: InstanceSettingProps
): ReactElement {
    const config = useSelector(selectConfig)
    const { t } = useTranslation(['setting', 'common'])
    const [instances, setInstances] = useState<Instance[]>(
        config.instance.preferType
    )
    const dispatch = useDispatch()

    const handleInstanceCheck = (instance: Instance) => {
        setInstances((state) => {
            return state.map((item) =>
                item.type === instance.type
                    ? { ...item, enabled: !item.enabled }
                    : item
            )
        })
    }
    const handleUrlChange = (
        event: ChangeEvent<HTMLInputElement>,
        instance: Instance
    ) => {
        setInstances((state) => {
            return state.map((item) =>
                item.type === instance.type
                    ? { ...item, url: event.target.value }
                    : item
            )
        })
    }
    const handleInstanceSort = (e: { to: number; from: number }) => {
        const stateClone = [...instances]
        stateClone.splice(e.to, 0, ...stateClone.splice(e.from, 1))
        setInstances(stateClone)
    }
    useEffect(() => {
        dispatch(updateInstance(instances))
    }, [instances])

    return (
        <Block className="mt-2">
            <BlockTitle className="text-lg">{t('setting:Source')}</BlockTitle>
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
                                <p>{instance.type}</p>
                                {instance.type !== 'local' && (
                                    <div>
                                        <label>{t('common:url')}</label>
                                        <input
                                            type="options"
                                            className="ml-2 bg-transparent border-b-[1px] border-[--f7-md-on-surface] text-[--f7-md-on-surface] focus:border-[--f7-theme-color] focus:border-b-2 w-50"
                                            placeholder="https://instance.url"
                                            value={instance.url}
                                            onChange={(e) =>
                                                handleUrlChange(e, instance)
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
    )
}
