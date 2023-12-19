import axios from 'axios'

export async function getInvInstances(): Promise<string[] | Error> {
    try {
        const { data } = await axios('https://api.invidious.io/instances.json')
        const sites = data.map((item: string[]) => item[0])
        return sites.map((site: string) =>
            site.indexOf('http://') === 0 || site.indexOf('htts://') === 0
                ? site
                : `https://${site}`
        )
    } catch (err) {
        return err as Error
    }
}

export async function getPipedInstances(): Promise<string[] | Error> {
    try {
        const { data } = await axios(
            'https://raw.githubusercontent.com/wiki/TeamPiped/Piped-Frontend/Instances.md'
        )
        const lines = data.split('\n')
        lines.splice(0, 8) // Skip the first 8 lines of md
        const instances: string[] = lines.map((line: string) => {
            return line.split('|')[1].trim()
        })
        return instances
    } catch (err) {
        return err as Error
    }
}
