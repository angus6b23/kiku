import React, { useEffect, type ReactElement } from 'react'
import { selectConfig } from '@/store/globalConfig'
import { useSelector } from 'react-redux'
import { Innertube } from 'youtubei.js/web'
import { Store, useCustomContext } from './context'

// console.log(Innertube)
export interface InnerTubeProps {}

export default function InnerTube(): ReactElement {
    const config = useSelector(selectConfig)
    const { innertube }: { innertube: React.MutableRefObject<Innertube> } =
        useCustomContext(Store)

    useEffect(() => {
        Innertube.create({
            lang: config.instance.lang,
            location: config.instance.location,
            fetch: async (input: RequestInfo | URL, init?: RequestInit) =>{
                return fetch(input, init)
            },
            generate_session_locally: true,
        }).then((res) => {
            innertube.current = res
        })
    }, [config.instance.lang, config.instance.location])
    return <></>
}
