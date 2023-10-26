import { createContext, useContext } from 'react'
import { Search } from './interfaces'
const Store = createContext<any>(undefined)
const SearchContext = createContext<undefined | Search>(undefined)

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

export {
    SearchContext,
    useCustomContext,
    Store,
}
