import { Icon } from 'framework7-react'
import React, { type ReactElement } from 'react'

export interface NoResultProps {}

export default function NoResult(): ReactElement {
    return (
        <section className="w-full h-full mt-[20%]">
            <div className="w-full h-fit flex flex-wrap justify-center flex-row items-center gap-8 my-auto">
                <div className="w-full">
                    <Icon
                        className="text-4xl lg:text-6xl w-full"
                        f7="search_circle"
                    />
                </div>
                <div className="w-full">
                    <h1 className="text-3xl lg:text-5xl w-full text-center">
                        No search result
                    </h1>
                </div>
                <div className="w-full">
                    <h3 className="text-xl lg:text-3xl w-full text-center">
                        Search something on the search bar
                    </h3>
                </div>
            </div>
        </section>
    )
}
