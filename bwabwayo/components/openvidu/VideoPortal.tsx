import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import VideoConference from '@/components/openvidu/VideoConference';
import { useChatRoomStore } from '@/stores/chatting/chatRoomStore';

interface VideoPortalProps {
  videoRoomId: number;
  onClose: () => void;
}

type Pos = { x: number; y: number };

const RATIO = 5 / 4;            // 원하는 비율
const MIN_W = 320;
const MIN_H = Math.round(MIN_W / RATIO);

export default function VideoPortal({ videoRoomId, onClose }: VideoPortalProps) {
  const portalRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const [mounted, setMounted] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [userMoved, setUserMoved] = useState(false);

  // 초기 위치(반응형 %)
  const initialPercent = { x: 8, y: 15 };
  const toPxFromPercent = (p: { x: number; y: number }): Pos => ({
    x: Math.round((window.innerWidth * p.x) / 100),
    y: Math.round((window.innerHeight * p.y) / 100),
  });

  // 위치(px)와 크기(px) 상태
  const [pos, setPos] = useState<Pos>(() => toPxFromPercent(initialPercent));
  const [size, setSize] = useState<{ w: number; h: number }>(() => {
    const w = Math.max(MIN_W, Math.round(window.innerWidth * 0.4)); // 기본 40vw
    return { w, h: Math.round(w / RATIO) };
  });

  const videoSessionId = useChatRoomStore((s) => s.videoSessionId);

  // 포털 생성
  useEffect(() => {
    const portalDiv = document.createElement('div');
    portalDiv.id = 'video-portal';
    portalDiv.style.cssText = `
      position: fixed; inset: 0;
      z-index: 2147483647;
      pointer-events: none;
    `;
    document.body.appendChild(portalDiv);
    portalRef.current = portalDiv;
    setMounted(true);

    return () => {
      if (portalRef.current && document.body.contains(portalRef.current)) {
        document.body.removeChild(portalRef.current);
      }
    };
  }, [videoRoomId]);

  // 리사이즈(윈도우) 대응
  useEffect(() => {
    const onResize = () => {
      if (!panelRef.current) return;
      if (!userMoved) {
        setPos(toPxFromPercent(initialPercent));
      }
      // 화면 밖 안나가게
      const maxX = Math.max(0, window.innerWidth - size.w);
      const maxY = Math.max(0, window.innerHeight - size.h);
      setPos((p) => ({ x: Math.max(0, Math.min(p.x, maxX)), y: Math.max(0, Math.min(p.y, maxY)) }));

      // 기본 폭을 40vw로 재설정하되, 현재보다 작을 때만 조정 (유저 의도 존중)
      const baseW = Math.round(window.innerWidth * 0.4);
      if (!userMoved && baseW !== size.w) {
        const w = Math.max(MIN_W, baseW);
        const h = Math.max(MIN_H, Math.round(w / RATIO));
        setSize({ w, h });
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [userMoved, size.w, size.h]);

  // 드래그 이동 (마우스)
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging || !panelRef.current) return;
      const newX = e.clientX - dragOffsetRef.current.x;
      const newY = e.clientY - dragOffsetRef.current.y;
      const maxX = Math.max(0, window.innerWidth - size.w);
      const maxY = Math.max(0, window.innerHeight - size.h);
      setPos({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    };
    const onUp = () => {
      if (dragging) setUserMoved(true);
      setDragging(false);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dragging, size.w, size.h]);

  // 커스텀 리사이즈 (마우스) — 비율 강제 유지
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!resizing || !panelRef.current) return;
      const panel = panelRef.current;
      // 패널의 좌상단 기준으로 마우스 위치까지의 delta
      const rect = panel.getBoundingClientRect();
      const deltaW = e.clientX - rect.left;
      const w = Math.max(MIN_W, Math.min(deltaW, window.innerWidth - pos.x));
      const h = Math.max(MIN_H, Math.round(w / RATIO));
      // 화면 하단 넘치면 w 줄이기
      const maxH = window.innerHeight - pos.y;
      const hh = Math.min(h, maxH);
      const ww = Math.max(MIN_W, Math.round(hh * RATIO));
      setSize({ w: ww, h: hh });
    };
    const onUp = () => setResizing(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [resizing, pos.x, pos.y]);

  if (!mounted || !portalRef.current) return null;

  const startDrag = (clientX: number, clientY: number) => {
    if (!panelRef.current) return;
    setDragging(true);
    const rect = panelRef.current.getBoundingClientRect();
    dragOffsetRef.current = { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startResize = () => setResizing(true);

  const tree = (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 2147483647 }}>
      <div
        ref={panelRef}
        className="pointer-events-auto"
        style={{
          position: 'fixed',
          top: pos.y,
          left: pos.x,
          width: `${size.w}px`,
          height: `${size.h}px`,
          boxSizing: 'border-box',
          background: '#ffffff',
          border: '2px solid #000',
          borderRadius: 12,
          boxShadow: '0 0 10px rgba(0,0,0,0.35)',
          overflow: 'hidden',
          // 여기는 브라우저 기본 resize 안 씀! (비율 깨져서)
          // resize: 'none',
        }}
      >
        {/* 드래그 핸들 */}
        <div
          onMouseDown={(e) => startDrag(e.clientX, e.clientY)}
          onTouchStart={(e) => {
            const t = e.touches[0];
            startDrag(t.clientX, t.clientY);
            e.preventDefault();
          }}
          onTouchMove={(e) => {
            if (!dragging) return;
            const t = e.touches[0];
            const newX = t.clientX - dragOffsetRef.current.x;
            const newY = t.clientY - dragOffsetRef.current.y;
            const maxX = Math.max(0, window.innerWidth - size.w);
            const maxY = Math.max(0, window.innerHeight - size.h);
            setPos({
              x: Math.max(0, Math.min(newX, maxX)),
              y: Math.max(0, Math.min(newY, maxY)),
            });
            e.preventDefault();
          }}
          onTouchEnd={() => {
            if (dragging) setUserMoved(true);
            setDragging(false);
          }}
          style={{
            height: 5,
            display: 'flex',
            alignItems: 'center',
            padding: '0 12px',
            gap: 8,
            borderBottom: '1px solid #e5e7eb',
            cursor: dragging ? 'grabbing' : 'grab',
            userSelect: 'none',
            background: '#fafafa',
          }}
        >
        </div>

        {/* 콘텐츠 */}
        <div style={{ width: '100%', height: 'calc(100% - 36px)' }}>
          <VideoConference videoRoomId={videoRoomId} onClose={onClose} />
        </div>

        {/* 🔧 커스텀 리사이즈 핸들 (오른쪽 아래 코너) */}
        <div
          onMouseDown={startResize}
          onTouchStart={(e) => {
            setResizing(true);
            e.preventDefault();
          }}
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            width: 18,
            height: 18,
            cursor: 'nwse-resize',
            // 시각적 표시
            background:
              'linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.25) 50%), transparent',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '100% 100%',
          }}
        />
      </div>
    </div>
  );

  return createPortal(tree, portalRef.current);
}
