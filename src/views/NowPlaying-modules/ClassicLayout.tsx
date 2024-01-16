import React, { useContext, type ReactElement } from 'react'
import { Block, Button, Icon } from 'framework7-react'
import { useSelector } from 'react-redux'
import { selectPlayer } from '@/store/playerReducers'
import Wavesurfer from '@/views/NowPlaying-modules/Wavesurfer'
import PlayingSlider from '@/views/NowPlaying-modules/PlayingSlider'
import { Store, useCustomContext } from '@/store/reactContext'
import { selectConfig } from '@/store/globalConfig'
import { memo } from 'react'
import { NowPlayingContext } from '@/store/reactContext'

export interface ClassicLayoutProps {}

function ClassicLayout(): ReactElement {
    const playerState = useSelector(selectPlayer)
    const config = useSelector(selectConfig)
    const { audio } = useCustomContext(Store)
    const nowPlayingFunctions = useContext(NowPlayingContext)
    const seekDuration: number = config.nowPlaying.seekDuration
    return (
        <>
            <Block>
                <div className="w-full 2xl:h-80 lg:h-64 md:h-48 h-36">
                    <img
                        className="object-contain h-full w-full"
                        src={playerState.currentPlaying?.thumbnailURL}
                    />
                </div>
                <div className="w-full flex justify-center py-4">
                    <h5 className="text-2xl text-center">
                        {playerState.currentPlaying?.title}
                    </h5>
                </div>
                {audio.current.duration < 90 * 40 ? (
                    <Wavesurfer
                        media={audio.current}
                        showTimeline={config.nowPlaying.showTimeline}
                    />
                ) : (
                    <PlayingSlider audio={audio.current} />
                )}
                <a
                    className="text-lg flex mt-4 items-center justify-center cursor-pointer"
                    onClick={nowPlayingFunctions.handleChangeTimestampStyle}
                >
                    <p>{nowPlayingFunctions.audioTimestamp}</p>
                </a>
                <div className="w-full flex justify-center gap-6">
                    <Button
                        className="h-32 w-32"
                        onClick={() =>
                            nowPlayingFunctions.handleSeek(
                                'backward',
                                seekDuration
                            )
                        }
                    >
                        <Icon
                            className="text-6xl"
                            f7={`gobackward_${seekDuration}`}
                        />
                    </Button>
                    <Button
                        className="h-32 w-32"
                        onClick={() => nowPlayingFunctions.handlePrevSong()}
                        disabled={nowPlayingFunctions.isFirstSong()}
                    >
                        <Icon className="text-6xl" f7="backward_end_fill" />
                    </Button>
                    <Button
                        className="h-32 w-32"
                        onClick={() => nowPlayingFunctions.togglePlayFunction()}
                    >
                        {playerState.status === 'playing' ? (
                            <Icon className="text-6xl" f7="pause_fill" />
                        ) : (
                            <Icon className="text-6xl" f7="play_fill" />
                        )}
                    </Button>
                    <Button
                        className="h-32 w-32"
                        onClick={() => nowPlayingFunctions.handleNextSong()}
                        disabled={nowPlayingFunctions.isLastSong()}
                    >
                        <Icon className="text-6xl" f7="forward_end_fill" />
                    </Button>
                    <Button
                        className="h-32 w-32"
                        onClick={() =>
                            nowPlayingFunctions.handleSeek(
                                'forward',
                                seekDuration
                            )
                        }
                    >
                        <Icon
                            className="text-6xl"
                            f7={`goforward_${seekDuration}`}
                        />
                    </Button>
                </div>
            </Block>
        </>
    )
}
const ClassicLayoutMemo = memo(ClassicLayout)
export default ClassicLayoutMemo
