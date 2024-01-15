import { createContext, useContext } from 'react'
const Store = createContext<any>(undefined)
const NowPlayingContext = createContext<any>(undefined)

function useCustomContext<T>(context: React.Context<T | undefined>): T {
    if (!context) {
        throw new Error('Unknown Context')
    } else {
        const testContext = useContext(context)
        if (!testContext) {
            throw new Error(`Context ${context.Provider.name} is undefined`)
        } else {
            return useContext(context) as T
        }
    }
}

export { useCustomContext, Store, NowPlayingContext }
