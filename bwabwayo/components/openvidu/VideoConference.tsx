import { OpenVidu } from 'openvidu-browser';
import axios from 'axios';
import React, { useState, useEffect, useRef } from 'react';
import './UserVideo.css';
import UserVideoComponent from './UserVideoComponent';

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

export default function VideoConference({ videoRoomId, onClose }: { videoRoomId: number; onClose?: () => void }) {
    const [state, setState] = useState<VideoConferenceState>({
        mySessionId: '',
        myUserName: 'Participant' + Math.floor(Math.random() * 100),
        session: undefined,
        mainStreamManager: undefined,
        publisher: undefined,
        subscribers: [],
    });

    const OVRef = useRef<OpenVidu | null>(null);
    
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
        <div className="w-full h-full bg-white flex flex-col">
            {state.session === undefined ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-bold text-gray-800 mb-2">화상 채팅 참여</h1>
                            <p className="text-gray-600">채팅방에 참여하여 화상 통화를 시작하세요</p>
                        </div>
                        <form className="space-y-4" onSubmit={joinSession}>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">참여자 이름</label>
                                <input
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    type="text"
                                    id="userName"
                                    value={myUserName}
                                    onChange={handleChangeUserName}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">세션 ID</label>
                                <input
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    type="text"
                                    id="sessionId"
                                    value={mySessionId}
                                    onChange={handleChangeSessionId}
                                    required
                                />
                            </div>
                            <button 
                                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                                type="submit"
                            >
                                참여하기
                            </button>
                        </form>
                    </div>
                </div>
            ) : null}

            {state.session !== undefined ? (
                <div className="flex flex-col h-full">
                    {/* 헤더 */}
                    <div className="bg-gray-800 text-white px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <h1 className="text-xl font-semibold">화상 채팅</h1>
                            <span className="text-sm text-gray-300">세션: {mySessionId}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                                onClick={switchCamera}
                            >
                                카메라 전환
                            </button>
                            <button
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                                onClick={leaveSession}
                            >
                                나가기
                            </button>
                        </div>
                    </div>

                    {/* 비디오 컨테이너 */}
                    <div className="flex-1 flex p-4 bg-gray-900">
                        {/* 메인 비디오 (왼쪽) */}
                        {state.mainStreamManager !== undefined ? (
                            <div className="flex-1 mr-2">
                                <div className="bg-gray-800 rounded-lg overflow-hidden h-full">
                                    <UserVideoComponent streamManager={state.mainStreamManager} />
                                </div>
                            </div>
                        ) : null}
                        
                        {/* 서브 비디오들 (오른쪽) */}
                        <div className="w-1/3 space-y-2">
                            {state.publisher !== undefined && (
                                <div 
                                    className="bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => handleMainVideoStream(state.publisher)}
                                >
                                    <UserVideoComponent streamManager={state.publisher} />
                                </div>
                            )}
                            {state.subscribers.map((sub, i) => (
                                <div 
                                    key={sub.id} 
                                    className="bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => handleMainVideoStream(sub)}
                                >
                                    <UserVideoComponent streamManager={sub} />
                                </div>
                            ))}
                        </div>
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
        // 토큰이 없으면 새로 요청
        const sessionId = await createSession(state.mySessionId);
        return await createToken(sessionId);
    }

    async function createSession(sessionId: string) {
        const response = await axios.post('https://i13e202.p.ssafy.io/be/api/sessions', { 
            videoRoomId: videoRoomId
        }, {
            headers: { 'Content-Type': 'application/json', },
        });
        console.log('세션발급 성공!:', response.data);
        return response.data; // The sessionId
    }

    async function createToken(sessionId: string) {
        const response = await axios.post('https://i13e202.p.ssafy.io/be/api/sessions/' + sessionId + '/token', {}, {
            headers: { 'Content-Type': 'application/json', },
        });
        console.log('토큰발급 성공!:', response.data);
        return response.data; // The token
    }
}
