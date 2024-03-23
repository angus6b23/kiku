import React, { useRef, type ReactElement, RefObject, useEffect, useState } from "react"
import { Store, useCustomContext } from '@/store/reactContext'
import {useSelector} from "react-redux"
import {selectPlayer} from "@/store/playerReducers"

export interface AudioBarsProps {

}

export default function AudioBars(): ReactElement {

    const { audio }: {audio: RefObject<HTMLAudioElement>} = useCustomContext(Store)
    const player = useSelector(selectPlayer)
    const audioCtx = useRef<AudioContext>()
    const analyser = useRef<AnalyserNode>()
    const dataArray = useRef<Uint8Array>()
    const interval = useRef<any>();
    const [barHeights, setBarHeights] = useState<number[]>(new Array(10).fill(0))
    
    useEffect(() => { //Initialize audioCtx, analyser and related variables
        audioCtx.current = new AudioContext()
        analyser.current = audioCtx.current.createAnalyser()
        analyser.current.fftSize = 256 * 4 
        dataArray.current = new Uint8Array(analyser.current.frequencyBinCount)
    }, [])

    const genHeight = (dataArray: Uint8Array) => {
        const res: number[] = []
        dataArray.forEach(data => {
            res.push(Math.round(data / 255 * 100))
        })
        return res.slice(0, Math.round(res.length /2))
    }
    useEffect(() => {
        console.log("effect called")
        clearInterval(interval.current)

        if (player.status === 'playing') {
                const audioContext = audioCtx.current as AudioContext
                const analyserNode = analyser.current as AnalyserNode
            setTimeout(() => {
                const mediaStream = audio.current?.captureStream();
                const source = audioContext.createMediaStreamSource(mediaStream)
                source.connect(analyserNode)
                if (mediaStream.getAudioTracks().length){
                    interval.current = setInterval(() => {
                        analyserNode.getByteFrequencyData(dataArray.current as Uint8Array)
                        setBarHeights(genHeight(dataArray.current as Uint8Array))
                    }, 50)
                } else {
                    clearInterval(interval.current)
                }
            }, 100)
        } else {
            setBarHeights((prevState) => {
                return new Array(prevState.length).fill(0)
            })
        }
    }, [player.status, player.currentPlaying])


    return <>
        <div className="absolute w-full h-full z-10 pointer-events-none opacity-20">
            <div className="absolute bottom-0 left-0 w-full h-full z-50 flex items-start justify-around">
            {
                barHeights.map((bar: number, index: number) => {
                    return (
                        <span key={`bar-${index}`} className="min-w-[2px] bg-white align-baseline h-full origin-bottom" style={{ transform: `scaleY(${bar/100})` }} />
                    )
            })
            }
            </div>
        </div>
    </>
}
