import { convertSecond } from '@/utils/format'
import { Range } from 'framework7-react'
import React, { type ReactElement } from 'react'

export interface PlayingSliderProps {
    audio: HTMLAudioElement
}

export default function PlayingSlider(props: PlayingSliderProps): ReactElement {
    const handleSliderChange = (duration: number) => {
        props.audio.currentTime = duration
    }
    const formatLabel = (e: number) => {
        return convertSecond(e)
    }
    return (
        <>
            <div className="px-10">
                {!isNaN(props.audio.duration) && (
                    <Range
                        max={props.audio.duration}
                        value={props.audio.currentTime}
                        onRangeChanged={handleSliderChange}
                        label={true}
                        formatLabel={formatLabel}
                    ></Range>
                )}
            </div>
        </>
    )
}
