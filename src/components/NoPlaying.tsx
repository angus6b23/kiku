import { Icon } from 'framework7-react'
import React, { type ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

export interface NoPlayingProps {}

export default function NoPlaying(): ReactElement {
    const { t } = useTranslation(['now-playing'])
    return (
        <section className="w-full h-full mt-[20%]">
            <div className="w-full h-fit flex flex-wrap justify-center flex-row items-center gap-8 my-auto">
                <div className="w-full">
                    <Icon
                        className="text-4xl lg:text-6xl w-full"
                        f7="music_note_list"
                    />
                </div>
                <div className="w-full">
                    <h1 className="text-3xl lg:text-5xl w-full text-center">
                        {t('now-playing:Nothing-is-playing')}
                    </h1>
                </div>
                <div className="w-full">
                    <h3 className="text-xl lg:text-3xl w-full text-center">
                        {t('now-playing:Add-something-to-playlist-to-play')}
                    </h3>
                </div>
            </div>
        </section>
    )
}
