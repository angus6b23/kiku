import React, { useEffect, type ReactElement } from "react"
import {selectConfig} from "@/store/globalConfig"
import {useSelector} from "react-redux"
import { Innertube } from "youtubei.js/web"
import {Store, useCustomContext} from "./context";

// console.log(Innertube)
export interface InnerTubeProps {

}

export default function InnerTube(): ReactElement {
    const config = useSelector(selectConfig);
    const {innertube}: {innertube: React.MutableRefObject<Innertube>} = useCustomContext(Store)

    useEffect(() => {
        if (config.instance.localEnabled){
            Innertube.create({
                lang: config.instance.lang,
                location: config.instance.country,
                fetch: (input, init) => fetch(input, init),
                generate_session_locally: true
            })
            .then(res => {
                innertube.current = res 
                console.log('innertube loaded', innertube.current)
                return innertube.current.getInfo('aEJB8IAMMpA')
            })
            .then(res =>{
                console.log(res)
            })
        }
    }, [config.instance.lang,  config.instance.country, config.instance.localEnabled])
    return <></>
}
