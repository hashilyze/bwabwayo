import { OpenVidu, Publisher } from 'openvidu-browser';
import axios from 'axios';
import React, { useState, useEffect, useRef } from 'react';
import './UserVideo.css';
import UserVideoComponent from './UserVideoComponent';
import { useChatRoomStore } from '@/stores/chatting/chatRoomStore';

interface VideoConferenceState {
  mySessionId: string;
  myUserName: string;
  session: any;
  mainStreamManager: any;
  publisher: any;
  subscribers: any[];
  currentVideoDevice?: any;
}

export default function VideoConference({ videoRoomId, onClose }: { videoRoomId: number; onClose?: () => void }) {
  const currentSelectedRoom = useChatRoomStore((s) => s.currentSelectedRoom);
  const closeVideoChat = useChatRoomStore((s) => s.closeVideoChat);
  const videoSessionId = useChatRoomStore((s) => s.videoSessionId);

  const getCurrentUserInfo = () => {
    if (!currentSelectedRoom) return null;
    const { userId, userNickname } = currentSelectedRoom;
    return { userId: String(userId), nickname: userNickname || `User_${userId}` };
  };
  const userInfo = getCurrentUserInfo();

  // ---------- state ----------
  const [state, setState] = useState<VideoConferenceState>({
    mySessionId: videoSessionId || String(videoRoomId),
    myUserName: userInfo?.nickname || `Participant${Math.floor(Math.random() * 100)}`,
    session: undefined,
    mainStreamManager: undefined,
    publisher: undefined,
    subscribers: [],
  });

  const [videoOn, setVideoOn] = useState(true); // 카메라 on/off

  // ---------- refs ----------
  const isMountedRef = useRef(true);
  const joinedRef = useRef(false);
  const OVRef = useRef<OpenVidu | null>(null);
  const sessionRef = useRef<any>(null);
  const publisherRef = useRef<Publisher | null>(null);
  const myConnIdRef = useRef<string | null>(null);
  const myPublisherSidRef = useRef<string | null>(null);
  const seenStreamIdsRef = useRef<Set<string>>(new Set());

  // OpenVidu connection.data 파싱 ( "이름" or {"clientData":"이름"} 모두 대응 )
  const getClientName = (conn: any): string => {
    const d = conn?.data;
    if (!d || typeof d !== 'string') return '';
    try {
      const s = d.trim();
      if (s.startsWith('{')) {
        const obj = JSON.parse(s);
        return obj.clientData || obj.client || obj.name || '';
      }
      return s.replace(/^"|"$/g, '');
    } catch {
      return String(d).replace(/^"|"$/g, '');
    }
  };

  // ---------- mount/unmount ----------
  useEffect(() => {
    if (joinedRef.current) return;
    joinedRef.current = true;
    isMountedRef.current = true;

    joinSession();

    const handleBeforeUnload = () => disconnectOnly();
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      isMountedRef.current = false;
      disconnectOnly();
      joinedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- disconnect ----------
  const disconnectOnly = () => {
    try {
      try {
        sessionRef.current?.off('streamCreated');
        sessionRef.current?.off('streamDestroyed');
        sessionRef.current?.off('exception');
        sessionRef.current?.off('connectionCreated');
      } catch {}

      try {
        publisherRef.current?.stream?.getMediaStream()?.getTracks()?.forEach((t) => t.stop());
      } catch {}

      try {
        (state.subscribers || []).forEach((sub) => {
          sub?.stream?.getMediaStream()?.getTracks()?.forEach((t: MediaStreamTrack) => t.stop());
        });
      } catch {}

      sessionRef.current?.disconnect();
    } finally {
      sessionRef.current = null;
      OVRef.current = null;
      publisherRef.current = null;
      myConnIdRef.current = null;
      myPublisherSidRef.current = null;
      seenStreamIdsRef.current.clear();

      setState((prev) => ({
        ...prev,
        session: undefined,
        subscribers: [],
        mainStreamManager: undefined,
        publisher: undefined,
      }));
      setVideoOn(true);
    }
  };

  const handleMainVideoStream = (stream: any) => {
    if (state.mainStreamManager !== stream) {
      setState((prev) => ({ ...prev, mainStreamManager: stream }));
    }
  };

  const deleteSubscriber = (streamManager: any) => {
    const targetId = streamManager?.stream?.streamId;
    setState((prev) => ({
      ...prev,
      subscribers: prev.subscribers.filter((s) => s?.stream?.streamId !== targetId),
    }));
  };

  // ---------- join ----------
  const joinSession = async () => {
    try {
      const ov = new OpenVidu();
      OVRef.current = ov;

      const session = ov.initSession();
      sessionRef.current = session;
      if (!isMountedRef.current) return;
      setState((prev) => ({ ...prev, session }));

      session.on('connectionCreated', (ev: any) => {
        const name = getClientName(ev.connection);
        const cid = ev.connection?.connectionId;
        if (name === state.myUserName && cid !== myConnIdRef.current) {
          console.warn('👻 Ghost connection detected:', cid);
        }
      });

      session.on('streamCreated', (event: any) => {
        const sid: string | undefined = event.stream?.streamId;
        const incomingConn = event.stream?.connection;
        const incomingConnId: string | undefined = incomingConn?.connectionId;
        const senderName = getClientName(incomingConn);

        // === 내 스트림/유령(같은 이름)/중복 차단 ===
        if (sid && myPublisherSidRef.current && sid === myPublisherSidRef.current) return;
        if (incomingConnId && myConnIdRef.current && incomingConnId === myConnIdRef.current) return;
        if (senderName && senderName === state.myUserName) return;
        if (sid && seenStreamIdsRef.current.has(sid)) return;

        const subscriber = session.subscribe(event.stream, undefined);
        if (!isMountedRef.current) return;

        if (sid) seenStreamIdsRef.current.add(sid);
        setState((prev) => ({ ...prev, subscribers: [...prev.subscribers, subscriber] }));
      });

      session.on('streamDestroyed', (event: any) => {
        const sid: string | undefined = event.stream?.streamId;
        if (sid) seenStreamIdsRef.current.delete(sid);
        deleteSubscriber(event.stream.streamManager);
      });

      session.on('exception', (exception: any) => {
        console.warn('OpenVidu exception:', exception);
      });

      const token = await getToken();
      if (!isMountedRef.current) return;

      await session.connect(token, { clientData: state.myUserName });
      myConnIdRef.current = session.connection?.connectionId || null;
      if (!isMountedRef.current) return;

      const publisher = await ov.initPublisherAsync(undefined, {
        audioSource: undefined,
        videoSource: undefined,
        publishAudio: true,
        publishVideo: true,
        resolution: '640x480',
        frameRate: 30,
        insertMode: 'APPEND',
        mirror: false,
      });
      if (!isMountedRef.current) return;

      await session.publish(publisher);
      publisherRef.current = publisher;
      myPublisherSidRef.current = publisher.stream?.streamId || null;

      const devices = await ov.getDevices();
      const videoDevices = devices.filter((d: any) => d.kind === 'videoinput');
      const currentVideoDeviceId =
        publisher.stream.getMediaStream().getVideoTracks()[0]?.getSettings()?.deviceId;
      const currentVideoDevice = videoDevices.find((d: any) => d.deviceId === currentVideoDeviceId);

      if (!isMountedRef.current) return;
      setState((prev) => ({
        ...prev,
        currentVideoDevice,
        mainStreamManager: publisher, // 기본은 내 화면(혼자일 때 풀스크린)
        publisher,
      }));
      setVideoOn(true);
    } catch (error: any) {
      console.error('There was an error connecting to the session:', error?.code || 'undefined', error?.message || error);
    }
  };

  const leaveSession = () => {
    disconnectOnly();
    closeVideoChat();
    onClose?.();
  };

  // ---------- camera toggle ----------
  const toggleCamera = async () => {
    if (!publisherRef.current) return;
    const next = !videoOn;
    try {
      await publisherRef.current.publishVideo(next);
      setVideoOn(next);
    } catch (e) {
      console.error('toggleCamera error:', e);
    }
  };

  // ---------- 1:1 PiP 레이아웃 ----------
  // 상대가 있으면 상대가 메인, 없으면 내 영상 메인
  const remote = state.subscribers[0];
  const mainStream = remote ?? state.mainStreamManager ?? state.publisher;
  const localPreview = state.publisher;

  return (
    <div className="w-full h-full bg-white flex flex-col">
      {/* 헤더 */}
      <div className=" px-6 py-3 my-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-black">화상 채팅</h1>
          <span className="text-sm text-gray-600">
            {currentSelectedRoom?.product?.title || `세션: ${state.mySessionId}`}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            className={`px-4 py-2 rounded-md transition-colors text-sm ${
              videoOn ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : 'bg-yellow-500 text-white hover:bg-yellow-600'
            }`}
            onClick={toggleCamera}
            disabled={!state.publisher}
            title={videoOn ? '카메라 끄기' : '카메라 켜기'}
          >
            {videoOn ? '카메라 끄기' : '카메라 켜기'}
          </button>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
            onClick={leaveSession}
          >
            나가기
          </button>
        </div>
      </div>

      {/* 본문: PiP 레이아웃 */}
      <div className="relative flex-1 bg-white overflow-hidden">
        {/* 메인(상대/또는 나) 전체 */}
        {mainStream ? (
          <div className="absolute inset-0 mx-2 ">
            <UserVideoComponent streamManager={mainStream} />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white">연결 중...</div>
        )}

        {/* PiP: 내 영상 (상대가 있을 때만 우하단에) */}
        {localPreview && state.subscribers.length > 0 && (
          <div
            className="
              absolute bottom-3 right-3
              w-[22vw] max-w-[280px] min-w-[160px]
              aspect-[16/9]
              border border-white/50 rounded-lg overflow-hidden shadow-lg
            "
            title="내 영상"
          >
            <UserVideoComponent streamManager={localPreview} />
          </div>
        )}

        {/* 혼자일 때 안내 */}
        {!remote && state.publisher && (
          <div className="absolute bottom-3 right-3 text-white/80 text-xs px-2 py-1 rounded bg-black/40">상대 대기 중…</div>
        )}
      </div>
    </div>
  );

  // -------- token helpers --------
  async function getToken() {
    const sessionId = await createSession(state.mySessionId);
    return await createToken(sessionId);
  }
  async function createSession(sessionId: string) {
    if (videoSessionId) {
      console.log('기존 세션ID 사용:', videoSessionId);
      return videoSessionId;
    }
    const res = await axios.post('https://i13e202.p.ssafy.io/be/api/sessions', { videoRoomId: sessionId }, { headers: { 'Content-Type': 'application/json' } });
    return res.data;
  }
  async function createToken(sessionId: string) {
    const res = await axios.post(`https://i13e202.p.ssafy.io/be/api/sessions/${sessionId}/token`, {}, { headers: { 'Content-Type': 'application/json' } });
    return res.data;
  }
}
