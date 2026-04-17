'use client';

import React, { Component } from 'react';

interface OpenViduVideoComponentProps {
    streamManager: any;
}

export default class OpenViduVideoComponent extends Component<OpenViduVideoComponentProps> {
    private videoRef: React.RefObject<HTMLVideoElement | null>;

    constructor(props: OpenViduVideoComponentProps) {
        super(props);
        this.videoRef = React.createRef();
    }

    componentDidUpdate(prevProps: OpenViduVideoComponentProps) {
        if (prevProps && !!this.videoRef.current) {
            this.props.streamManager.addVideoElement(this.videoRef.current);
        }
    }

    componentDidMount() {
        if (this.props && !!this.videoRef.current) {
            this.props.streamManager.addVideoElement(this.videoRef.current);
        }
    }

    render() {
        return <video autoPlay={true} ref={this.videoRef} className="w-full h-full object-cover" />;
    }
} 