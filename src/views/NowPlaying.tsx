import React, { useRef, useEffect, useState, type ReactElement } from "react"
import {Store, useCustomContext} from "../components/context"
import {PlayerAction, PlayerState} from "../components/interfaces"
import { Block } from "framework7-react"
import Wavesurfer from "../components/Wavesurfer"

export default function NowPlaying(): ReactElement {
    const waversurferRef = useRef(null);
    const { playerState, dispatchPlayer }: {playerState: PlayerState, dispatchPlayer: React.Dispatch<PlayerAction>} = useCustomContext(Store)
    return (
        <>
            {
                playerState.currentPlaying  === undefined ?
                    <Block>Nothing is playing</Block> :
                    <Block>
                        Playing {`${playerState.currentPlaying?.title}`}
                        <div className="h-20 w-full" ref={waversurferRef} />
                        <Wavesurfer url={playerState.currentPlaying.streamUrl} />
                    </Block>
            }
        </>
    )
}
