import React, { type ReactElement } from "react"

export interface ChannelViewProps {
    channelid: string 
}

export default function ChannelView(props: ChannelViewProps): ReactElement {
    return <>ChannelView {props.channelid}</>
}
