import { Instance } from "@/typescript/interfaces";
import Innertube from "youtubei.js/agnostic";
import presentToast from "@/components/Toast";

export async function autoFallback<T>(
    payload: string,
    localHandler: (payload: string, innertube: Innertube) => Promise<T | Error>,
    invidiousHandler: (payload: string, baseUrl: string) => Promise<T | Error>,
    pipedHandler: (payload: string, baseUrl: string) => Promise<T | Error>,
    instances: Instance[],
    innertube: Innertube,
    type: string
): Promise<T | Error> {
    let res: Error | T
    if (instances.length === 0) {
        return new Error(`Failed while performing ${type}: All instances / api returned error`)
    }
    if (instances[0].enabled === false) {
        return await autoFallback(payload, localHandler, invidiousHandler, pipedHandler, instances.slice(1), innertube, type)
    }

    switch (instances[0].type) {
        case 'local':
            res = await localHandler(payload, innertube)
            break
        case 'invidious':
            res = await invidiousHandler(payload, instances[0].url)
            break
        case 'piped':
            res = await pipedHandler(payload, instances[0].url)
            break
        default:
            throw new Error('Unknown instance in handle Search')
    }
    if (res instanceof Error) {
        presentToast('error', `${type} > ` + res.message)
        return await autoFallback(payload, localHandler, invidiousHandler, pipedHandler, instances.slice(1), innertube, type)
    }
    return res
}
