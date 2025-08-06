import { OpenVidu } from 'openvidu-browser';
import axios from 'axios';
import React, { useState, useEffect, useRef } from 'react';
import './UserVideo.css';
import UserVideoComponent from './UserVideoComponent';

// const APPLICATION_SERVER_URL = process.env.NODE_ENV === 'production' ? '' : 'https://demos.openvidu.io/';

interface VideoConferenceState {
    mySessionId: string;
    myUserName: string;
    session: any;
    mainStreamManager: any;
    publisher: any;
    subscribers: any[];
    currentVideoDevice?: any;
    token?: string;
}

export default function VideoConference({ videoRoomId }: { videoRoomId: number }) {
    const [sessionId, setSessionId] = useState<string>('');
    const [token, setToken] = useState<string>('');
    
    const [state, setState] = useState<VideoConferenceState>({
        mySessionId: '',
        myUserName: 'Participant' + Math.floor(Math.random() * 100),
        session: undefined,
        mainStreamManager: undefined,
        publisher: undefined,
        subscribers: [],
    });

    const OVRef = useRef<OpenVidu | null>(null);


    // 컴포넌트 열리면 실행
    useEffect(() => {
        const initializeSession = async () => {
            try {
                // 1. 세션 발급하기
                const requestSession = async (videoRoomId: number): Promise<string> => {
                    const response = await fetch(`https://i13e202.p.ssafy.io/be/api/sessions`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', },
                        body: JSON.stringify({ videoRoomId: videoRoomId }),
                    });
                    const data = await response.json();
                    console.log('세션발급 성공!:', data);
                    return data;
                };  
                
                const sessionIdResult = await requestSession(videoRoomId);
                
                // sessionId를 별도 상태에 저장
                setSessionId(sessionIdResult);
                setState(prev => ({
                    ...prev,
                    mySessionId: sessionIdResult
                }));

                // 2. 토큰 발급하기
                const requestToken = async (sessionId: number): Promise<string> => {
                    const response = await fetch(`https://i13e202.p.ssafy.io/be/api/sessions/${sessionId}/token`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', },
                    });
                    const data = await response.json();
                    console.log('Token response:', data);
                    return data.token;
                };

                const tokenResult = await requestToken(Number(sessionIdResult));
                
                // 토큰을 별도 상태에 저장
                setToken(tokenResult);
                setState(prev => ({
                    ...prev,
                    token: tokenResult
                }));

            } catch (error) {
                console.error('Error initializing session:', error);
            }
        };

        initializeSession();
    }, [videoRoomId]);

    
    useEffect(() => {
        const handleBeforeUnload = () => {
            leaveSession();
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    const handleChangeSessionId = (e: React.ChangeEvent<HTMLInputElement>) => {
        setState(prev => ({
            ...prev,
            mySessionId: e.target.value,
        }));
    };

    const handleChangeUserName = (e: React.ChangeEvent<HTMLInputElement>) => {
        setState(prev => ({
            ...prev,
            myUserName: e.target.value,
        }));
    };

    const handleMainVideoStream = (stream: any) => {
        if (state.mainStreamManager !== stream) {
            setState(prev => ({
                ...prev,
                mainStreamManager: stream
            }));
        }
    };

    const deleteSubscriber = (streamManager: any) => {
        let subscribers = state.subscribers;
        let index = subscribers.indexOf(streamManager, 0);
        if (index > -1) {
            subscribers.splice(index, 1);
            setState(prev => ({
                ...prev,
                subscribers: subscribers,
            }));
        }
    };

    const joinSession = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        // --- 1) Get an OpenVidu object ---
        OVRef.current = new OpenVidu();

        // --- 2) Init a session ---
        const session = OVRef.current.initSession();
        
        setState(prev => ({
            ...prev,
            session: session,
        }));

        // --- 3) Specify the actions when events take place in the session ---

        // On every new Stream received...
        session.on('streamCreated', (event: any) => {
            // Subscribe to the Stream to receive it. Second parameter is undefined
            // so OpenVidu doesn't create an HTML video by its own
            var subscriber = session.subscribe(event.stream, undefined);
            setState(prev => ({
                ...prev,
                subscribers: [...prev.subscribers, subscriber],
            }));
        });

        // On every Stream destroyed...
        session.on('streamDestroyed', (event: any) => {
            // Remove the stream from 'subscribers' array
            deleteSubscriber(event.stream.streamManager);
        });

        // On every asynchronous exception...
        session.on('exception', (exception: any) => {
            console.warn(exception);
        });

        // --- 4) Connect to the session with a valid user token ---

        // Get a token from the OpenVidu deployment
        try {
            const token = await getToken();
            // First param is the token got from the OpenVidu deployment. Second param can be retrieved by every user on event
            // 'streamCreated' (property Stream.connection.data), and will be appended to DOM as the user's nickname
            await session.connect(token, { clientData: state.myUserName });

            // --- 5) Get your own camera stream ---

            // Init a publisher passing undefined as targetElement (we don't want OpenVidu to insert a video
            // element: we will manage it on our own) and with the desired properties
            let publisher = await OVRef.current!.initPublisherAsync(undefined, {
                audioSource: undefined, // The source of audio. If undefined default microphone
                videoSource: undefined, // The source of video. If undefined default webcam
                publishAudio: true, // Whether you want to start publishing with your audio unmuted or not
                publishVideo: true, // Whether you want to start publishing with your video enabled or not
                resolution: '640x480', // The resolution of your video
                frameRate: 30, // The frame rate of your video
                insertMode: 'APPEND', // How the video is inserted in the target element 'video-container'
                mirror: false, // Whether to mirror your local video or not
            });

            // --- 6) Publish your stream ---
            session.publish(publisher);

            // Obtain the current video device in use
            var devices = await OVRef.current!.getDevices();
            var videoDevices = devices.filter((device: any) => device.kind === 'videoinput');
            var currentVideoDeviceId = publisher.stream.getMediaStream().getVideoTracks()[0].getSettings().deviceId;
            var currentVideoDevice = videoDevices.find((device: any) => device.deviceId === currentVideoDeviceId);

            // Set the main video in the page to display our webcam and store our Publisher
            setState(prev => ({
                ...prev,
                currentVideoDevice: currentVideoDevice,
                mainStreamManager: publisher,
                publisher: publisher,
            }));
        } catch (error: any) {
            console.log('There was an error connecting to the session:', error.code, error.message);
        }
    };

    const leaveSession = () => {
        // --- 7) Leave the session by calling 'disconnect' method over the Session object ---
        const mySession = state.session;

        if (mySession) {
            mySession.disconnect();
        }

        // Empty all properties...
        OVRef.current = null;
        setState({
            mySessionId: 'SessionA',
            myUserName: 'Participant' + Math.floor(Math.random() * 100),
            session: undefined,
            subscribers: [],
            mainStreamManager: undefined,
            publisher: undefined
        });
    };

    const switchCamera = async () => {
        try {
            const devices = await OVRef.current!.getDevices();
            var videoDevices = devices.filter((device: any) => device.kind === 'videoinput');

            if (videoDevices && videoDevices.length > 1) {
                var newVideoDevice = videoDevices.filter((device: any) => device.deviceId !== state.currentVideoDevice?.deviceId);

                if (newVideoDevice.length > 0) {
                    // Creating a new publisher with specific videoSource
                    // In mobile devices the default and first camera is the front one
                    var newPublisher = OVRef.current!.initPublisher(undefined, {
                        videoSource: newVideoDevice[0].deviceId,
                        publishAudio: true,
                        publishVideo: true,
                        mirror: true
                    });

                    await state.session.unpublish(state.mainStreamManager);
                    await state.session.publish(newPublisher);
                    
                    setState(prev => ({
                        ...prev,
                        currentVideoDevice: newVideoDevice[0],
                        mainStreamManager: newPublisher,
                        publisher: newPublisher,
                    }));
                }
            }
        } catch (e) {
            console.error(e);
        }
    };

    const mySessionId = state.mySessionId;
    const myUserName = state.myUserName;

    return (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1280px] z-99 bg-white">
            {state.session === undefined ? (
                <div id="join">
                    <div id="img-div">
                        <img src="resources/images/openvidu_grey_bg_transp_cropped.png" alt="OpenVidu logo" />
                    </div>
                    <div id="join-dialog" className="jumbotron vertical-center">
                        <h1> Join a video session </h1>
                        <form className="form-group" onSubmit={joinSession}>
                            <p>
                                <label>Participant: </label>
                                <input
                                    className="form-control"
                                    type="text"
                                    id="userName"
                                    value={myUserName}
                                    onChange={handleChangeUserName}
                                    required
                                />
                            </p>
                            <p>
                                <label> Session: </label>
                                <input
                                    className="form-control"
                                    type="text"
                                    id="sessionId"
                                    value={mySessionId}
                                    onChange={handleChangeSessionId}
                                    required
                                />
                            </p>
                            <p className="text-center">
                                <input className="btn btn-lg btn-success" name="commit" type="submit" value="JOIN" />
                            </p>
                        </form>
                    </div>
                </div>
            ) : null}

            {state.session !== undefined ? (
                <div id="session">
                    <div id="session-header">
                        <h1 id="session-title">{mySessionId}</h1>
                        <input
                            className="btn btn-large btn-danger"
                            type="button"
                            id="buttonLeaveSession"
                            onClick={leaveSession}
                            value="Leave session"
                        />
                        <input
                            className="btn btn-large btn-success"
                            type="button"
                            id="buttonSwitchCamera"
                            onClick={switchCamera}
                            value="Switch Camera"
                        />
                    </div>

                    {state.mainStreamManager !== undefined ? (
                        <div id="main-video" className="col-md-6">
                            <UserVideoComponent streamManager={state.mainStreamManager} />
                        </div>
                    ) : null}
                    <div id="video-container" className="col-md-6">
                        {state.publisher !== undefined ? (
                            <div className="stream-container col-md-6 col-xs-6" onClick={() => handleMainVideoStream(state.publisher)}>
                                <UserVideoComponent
                                    streamManager={state.publisher} />
                            </div>
                        ) : null}
                        {state.subscribers.map((sub, i) => (
                            <div key={sub.id} className="stream-container col-md-6 col-xs-6" onClick={() => handleMainVideoStream(sub)}>
                                <span>{sub.id}</span>
                                <UserVideoComponent streamManager={sub} />
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}
        </div>
    );

    /**
     * --------------------------------------------
     * GETTING A TOKEN FROM YOUR APPLICATION SERVER
     * --------------------------------------------
     * The methods below request the creation of a Session and a Token to
     * your application server. This keeps your OpenVidu deployment secure.
     *
     * In this sample code, there is no user control at all. Anybody could
     * access your application server endpoints! In a real production
     * environment, your application server must identify the user to allow
     * access to the endpoints.
     *
     * Visit https://docs.openvidu.io/en/stable/application-server to learn
     * more about the integration of OpenVidu in your application server.
     */
    async function getToken() {
        // 이미 저장된 토큰이 있으면 반환
        if (token) {
            return token;
        }
        
        // 토큰이 없으면 새로 요청
        const sessionId = await createSession(state.mySessionId);
        return await createToken(sessionId);
    }

    async function createSession(sessionId: string) {
        const response = await axios.post('https://demos.openvidu.io/api/sessions', { customSessionId: sessionId }, {
            headers: { 'Content-Type': 'application/json', },
        });
        return response.data; // The sessionId
    }

    async function createToken(sessionId: string) {
        const response = await axios.post('https://demos.openvidu.io/api/sessions/' + sessionId + '/token', {}, {
            headers: { 'Content-Type': 'application/json', },
        });
        return response.data; // The token
    }
}
