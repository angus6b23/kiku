import axios from "axios";

export async function getInvInstances(): Promise<string[] | Error>{
	try{
		const {data} = await axios('https://api.invidious.io/instances.json');
		const sites = data.map((item: string[]) => item[0]);
		return sites.map((site: string) => site.indexOf('http://') === 0 || site.indexOf('htts://') === 0 ? site : `https://${site}`)
	} catch(err) {
		return err as Error
	}
}

export async function getPipedInstances(): Promise<string[] | Error>{
	try{
		const {data} = await axios('https://raw.githubusercontent.com/wiki/TeamPiped/Piped-Frontend/Instances.md')
		const lines = data.split('\n');
		const instances: (string | undefined)[] = lines.map((line:string, index: number) => {
			if (index < 4){
				return undefined
			} else {
				return line.split('|')[1].trim()
			}
		})
		return instances.filter(item => item !== undefined) as string[]
	} catch(err){
		return err as Error
	}
}
