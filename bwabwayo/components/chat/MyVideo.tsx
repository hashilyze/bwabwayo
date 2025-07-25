'use client'

import { useRef, useImperativeHandle, forwardRef } from 'react'

const MyVideo = forwardRef((props, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null)

  // 부모에서 사용할 수 있는 start 함수 등록
  useImperativeHandle(ref, () => ({
    startVideo: () => {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream
          }
        })
        .catch((err) => {
          console.error('미디어 접근 실패:', err)
        })
    }
  }))

  return (
    <div>
      <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', maxWidth: 480 }} />
    </div>
  )
})

MyVideo.displayName = 'MyVideo'

export default MyVideo