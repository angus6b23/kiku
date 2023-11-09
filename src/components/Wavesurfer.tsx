import React, { useRef, useState, useEffect, memo } from 'react'
// Import WaveSurfer
import WaveSurfer from 'wavesurfer.js'
import { WaveSurferOptions } from 'wavesurfer.js'
import TimelinePlugin from 'wavesurfer.js/dist/plugins/timeline'
import HoverPlugin from 'wavesurfer.js/dist/plugins/hover'

// WaveSurfer hook
const useWavesurfer = (
    containerRef: React.RefObject<HTMLElement>,
    options: WaveSurferOptions
) => {
    const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null)

    // Initialize wavesurfer when the container mounts
    // or any of the props change
    useEffect(() => {
        if (!containerRef.current) return

        const ws = WaveSurfer.create({
            ...options,
            normalize: true,
            plugins: [TimelinePlugin.create(), HoverPlugin.create()],
            container: containerRef.current,
        })

        setWavesurfer(ws)

        return () => {
            ws.destroy()
        }
    }, [options, containerRef])

    return wavesurfer
}

// Create a React component that will render wavesurfer.
// Props are wavesurfer options.
function WaveSurferPlayer(props: WaveSurferOptions) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [currentTime, setCurrentTime] = useState(0)
    const wavesurfer = useWavesurfer(containerRef, props)
    useEffect(() => {
        if (!wavesurfer) return

        const subscriptions = [
            wavesurfer.on('timeupdate', (currentTime) =>
                setCurrentTime(currentTime)
            ),
        ]

        return () => {
            subscriptions.forEach((unsub) => unsub())
        }
    }, [wavesurfer])
    return (
        <>
            <div ref={containerRef} style={{ minHeight: '120px' }} />

            <p>Seconds played: {currentTime}</p>
        </>
    )
}
export default memo(WaveSurferPlayer)
