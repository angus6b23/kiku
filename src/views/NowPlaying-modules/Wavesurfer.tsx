import React, { useRef, useState, useEffect, memo } from 'react'
// Import WaveSurfer
import WaveSurfer from 'wavesurfer.js'
import TimelinePlugin from 'wavesurfer.js/dist/plugins/timeline'
import HoverPlugin from 'wavesurfer.js/dist/plugins/hover'
import { GenericPlugin } from 'wavesurfer.js/dist/base-plugin'

// WaveSurfer hook
const useWavesurfer = (
    containerRef: React.RefObject<HTMLElement>,
    options: any
) => {
    const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null)
    const plugins: GenericPlugin[] | undefined = options.showTimeline
        ? [TimelinePlugin.create(), HoverPlugin.create()]
        : [HoverPlugin.create()]
    // Initialize wavesurfer when the container mounts
    // or any of the props change
    useEffect(() => {
        if (!containerRef.current) return

        const ws = WaveSurfer.create({
            ...options,
            normalize: true,
            plugins: plugins,
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
function WaveSurferPlayer(props: any) {
    const containerRef = useRef<HTMLDivElement>(null)
    useWavesurfer(containerRef, props)
    return (
        <>
            <div ref={containerRef} style={{ minHeight: '120px' }} />
        </>
    )
}
export default memo(WaveSurferPlayer)
