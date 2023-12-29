import { selectLocalBlobs } from '@/store/blobStorage'
import { selectConfig } from '@/store/globalConfig'
import { LocalBlobEntry } from '@/typescript/interfaces'
import {
    Block,
    Button,
    Card,
    CardContent,
    CardHeader,
    Checkbox,
    Icon,
    Link,
    NavRight,
    Navbar,
    Page,
} from 'framework7-react'
import React, { useState, type ReactElement, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'

export interface StorageManagementProps {}
interface ContentRecord extends LocalBlobEntry {
    exist: boolean
    selected: boolean
}

export default function StorageManagement(
    props: StorageManagementProps
): ReactElement {
    const { t } = useTranslation(['storage'])
    const config = useSelector(selectConfig)
    const localBlobs = useSelector(selectLocalBlobs)
    const dispatch = useDispatch()
    const [refresh, triggerRefresh] = useState(true)
    const [fileList, setFileList] = useState<ContentRecord[]>([])
    const [sortState, setSortState] = useState({
        col: 'lastAccess',
        order: 'dec',
    })
    /* eslint-disable-next-line @typescript-eslint/no-var-requires */
    const { ipcRenderer } = require('electron')

    const displayDate = (number: number) => {
        const dateTimeFormat = new Intl.DateTimeFormat(config.ui.lang, {
            dateStyle: 'short',
            timeStyle: 'short',
        })
        const date = new Date(number)
        return dateTimeFormat.format(date)
    }
    const handleTopCheckboxChange = () => {
        if (fileList.every(file => file.selected)){
            setFileList(prevState => prevState.map(file => { return {...file, selected: false}}))
        } else {
            setFileList(prevState => prevState.map(file => {
                return {
                    ...file,
                    selected: true
                }
            }))
        }
    }
    useEffect(() => {
        let folderContent: string[]
        ipcRenderer.invoke('get-folder-content').then((list: string[]) => {
            folderContent = list
            const contentRecord: ContentRecord[] = localBlobs.map((record) => {
                const fileExist = folderContent.some((content: string) => {
                    const fileExtension = record.extension.includes('mp4')
                        ? 'm4a'
                        : 'opus'
                        return content === `${record.id}.${fileExtension}`
                })
                return { ...record, exist: fileExist, selected: false }
            }) // Search for existance of all localBlobs
            setFileList(
                contentRecord.sort((a, b) => b.lastAccess - a.lastAccess)
            )
        })
    }, [localBlobs, refresh])

    const sortBy = (type: string) => {
        let sorted: ContentRecord[]
        const newSortState = {
            col: type,
            order:
                sortState.col === type && sortState.order === 'dec'
                    ? 'acc'
                    : 'dec',
        }
        switch (type) {
            case 'title':
                if (newSortState.order === 'acc') {
                sorted = [...fileList].sort((a, b) =>
                                            a.title.localeCompare(b.title)
                                           )
            } else {
                sorted = [...fileList].sort((a, b) =>
                                            b.title.localeCompare(a.title)
                                           )
            }
            break
            case 'id':
                if (newSortState.order === 'acc') {
                sorted = [...fileList].sort((a, b) =>
                                            a.id.localeCompare(b.id)
                                           )
            } else {
                sorted = [...fileList].sort((a, b) =>
                                            b.id.localeCompare(a.id)
                                           )
            }
            break
            case 'create':
                if (newSortState.order === 'acc') {
                sorted = [...fileList].sort((a, b) => a.created - b.created)
            } else {
                sorted = [...fileList].sort((a, b) => b.created - a.created)
            }
            break
            case 'lastAccess':
                if (newSortState.order === 'acc') {
                sorted = [...fileList].sort(
                    (a, b) => a.lastAccess - b.lastAccess
                )
            } else {
                sorted = [...fileList].sort(
                    (a, b) => b.lastAccess - a.lastAccess
                )
            }
            break
            case 'exist':
                if (newSortState.order === 'acc') {
                sorted = [...fileList].sort((a, b) =>
                                            a === b ? 0 : a ? -1 : 1
                                           )
            } else {
                sorted = [...fileList].sort((a, b) =>
                                            a === b ? 0 : b ? -1 : 1
                                           )
            }
            break
            default:
                sorted = fileList
        }
        setFileList(sorted)
        setSortState(newSortState)
    }
    const selectItem = (id: string) => {
        setFileList((prevState) =>
                    prevState.map((file) =>
                                  file.id === id ? { ...file, selected: !file.selected } : file
                                 )
                   )
    }
    return (
        <>
            <Page>
                <Navbar title={t('storage:Storage-management')}>
                    <NavRight>
                        <Link popupClose>
                            <Icon f7="xmark" />
                        </Link>
                    </NavRight>
                </Navbar>
                <Block>
                    <Card className="data-table data-table-init">
                        <CardHeader>
                            { fileList.some(file => file.selected) ?
                                // Top status bar when there are items selected
                                <div className="data-table-header">
                                    <div className="data-table-title">
                                        {fileList.filter(file => file.selected).length} {t('storage:items-selected')}
                                    </div>
                                    <div className="data-table-actions">
                                        <Button fill>{t('storage:Add-entries-to-current-playlist')}</Button>
                                        <Button fill>{t('storage:Remove-selected-entries')}</Button>
                                    </div>
                                </div>
                                :
                                // Top status bar when there are no item selected
                                <div className="data-table-header">
                                    <div className="data-table-title">
                                        {t('storage:Audio-files')}
                                    </div>
                                    <div className="data-table-actions">
                                        <Button fill>{t('storage:Remove-non-existent-entries')}</Button>
                                        <Button fill>{t('storage:Remove-unhandled-entries')}</Button>
                                        <Button fill>{t('storage:Remove-all-files')}</Button>
                                    </div>
                                </div>
                            }
                        </CardHeader>
                        <CardContent padding={false}>
                            <table>
                                <thead>
                                    <tr>
                                        <th className="checkbox-cell">
                                            <Checkbox checked={fileList.every(file => file.selected)} indeterminate={fileList.some(file => file.selected) && !fileList.every(file => file.selected)} onChange={handleTopCheckboxChange}/>
                                        </th>
                                        <th
                                            className={`label-cell sortable-cell ${sortState.col === "title" && 'sortable-cell-active'} ${sortState.order === 'dec' ? 'sortable-asc' : 'sortable-desc'}`}
                                            onClick={() => sortBy('title')}
                                        >
                                            {t('storage:Title')}
                                        </th>
                                        <th
                                            className={`label-cell sortable-cell large-only ${sortState.col === "id" && 'sortable-cell-active'} ${sortState.order === 'dec' ? 'sortable-asc' : 'sortable-desc'}`}
                                            onClick={() => sortBy('id')}
                                        >
                                            {t('storage:Video-Id')}
                                        </th>
                                        <th
                                            className={`label-cell sortable-cell ${sortState.col === "create" && 'sortable-cell-active'} ${sortState.order === 'dec' ? 'sortable-asc' : 'sortable-desc'}`}
                                            onClick={() => sortBy('create')}
                                        >
                                            {t('storage:Created-on')}
                                        </th>
                                        <th
                                            className={`label-cell sortable-cell ${sortState.col === "lastAccess" && 'sortable-cell-active'} ${sortState.order === 'dec' ? 'sortable-asc' : 'sortable-desc'}`}
                                            onClick={() => sortBy('lastAccess')}
                                        >
                                            {t('storage:Last-access')}
                                        </th>
                                        <th 
                                            className={`label-cell sortable-cell ${sortState.col === "exist" && 'sortable-cell-active'} ${sortState.order === 'dec' ? 'sortable-asc' : 'sortable-desc'}`}
                                            onClick={()=>sortBy('exist')}
                                        >
                                            {t('storage:File-exist')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {fileList.map((file) => (
                                        <tr key={file.id}>
                                            <td className="checkbox-cell">
                                                <Checkbox
                                                    checked={file.selected}
                                                    onChange={() =>
                                                        selectItem(file.id)
                                                    }
                                                />
                                            </td>
                                            <td className="label-cell">
                                                {file.title}
                                            </td>
                                            <td className="label-cell large-only">
                                                {file.id}
                                            </td>
                                            <td className="label-cell">
                                                {displayDate(file.created)}
                                            </td>
                                            <td className="label-cell">
                                                {displayDate(file.lastAccess)}
                                            </td>
                                            <td className="label-cell">
                                                {file.exist ? (
                                                    <Icon f7="checkmark" />
                                                ) : (
                                                    <Icon f7="xmark" />
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </Block>
            </Page>
        </>
    )
}
