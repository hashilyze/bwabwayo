'use client'

import { useEffect, useRef, useState } from "react"
import ChatInput from "@/components/chat/ChatInput"

export default function WebTest(){
    const [showVideo, setShowVideo] = useState(false)
    const videoRef = useRef<{ startVideo: () => void }>(null)

    useEffect(() => {
      if (showVideo) {
        videoRef.current?.startVideo()
      }
    }, [showVideo])
  
    const handleStart = () => {
      setShowVideo(true)
    }

    return(
        <div className="custom-gradient rounded-lg flex gap-10 items-end px-8 py-12 relative overflow-hidden mb-20">
          <div>
            <div className="flex gap-2 items-center"><img width={16} src="/icon/security-green.svg" alt="" /><p className="text-[#BBF7D0]">안심하고 믿을만하게 할 수 있는</p></div>
            <h1 className="flex flex-col text-white text-4xl font-bold gap-1 mt-5 mb-6">화상채팅<span className='text-[#85EDAD]'>중고거래 서비스</span><span className='text-[#FDBA74]'>TrustTrade</span></h1>
            <ul className='grid grid-cols-2 gap-4'>
              <li className='p-4 bg-white/16 rounded-xl flex gap-4 items-center w-[430px]'>
                  <div className='w-[45px] h-[45px] bg-[#60A5FA] flex items-center justify-center rounded'><img width={20} src="/icon/video-white.svg" alt="" /></div>
                  <div>
                    <p className='text-white'>실시간 화상거래</p>
                    <p className='text-white/50'>직접 보고 확인</p>
                  </div>
              </li>
              <li className='p-4 bg-white/16 rounded-xl flex gap-4 items-center w-[430px]'>
                  <div className='w-[45px] h-[45px] bg-[#4ADE80] flex items-center justify-center rounded'><img width={20} src="/icon/security-white.svg" alt="" /></div>
                  <div>
                    <p className='text-white'>AI 기능 제공</p>
                    <p className='text-white/50'>제품 템플릿, 챗봇기능</p>
                  </div>
              </li>
              <li className='p-4 bg-white/16 rounded-xl flex gap-4 items-center w-[430px]'>
                  <div className='w-[45px] h-[45px] bg-[#C084FC] flex items-center justify-center rounded'><img width={20} src="/icon/people-white.svg" alt="" /></div>
                  <div>
                    <p className='text-white'>신뢰성 보장</p>
                    <p className='text-white/50'>평점 시스템</p>
                  </div>
              </li>
              <li className='p-4 bg-white/16 rounded-xl flex gap-4 items-center w-[430px]'>
                  <div className='w-[45px] h-[45px] bg-[#FB923C] flex items-center justify-center rounded'><img width={20} src="/icon/video-white.svg" alt="" /></div>
                  <div>
                    <p className='text-white'>보안 거래</p>
                    <p className='text-white/50'>암호화 통신</p>
                  </div>
              </li>
            </ul>
            
            {/* 화상 테스트.. */}
            {showVideo &&
            <div className="
              absolute top-1/2 left-1/2 z-1
              transform -translate-x-1/2 -translate-y-1/2
              transform -translate-x-1/2 -translate-y-1/2 
              w-full h-full
              flex items-center justify-center
              bg-black/50
            ">
                <div
                    className={`
                      grid grid-cols-2
                      w-[98%] h-[95%]
                      bg-white rounded-xl overflow-hidden shadow-lg
                    `}
                >
                    <div className="flex flex-col flex-wrap">
                      {/* chat-title */}
                      <div className="chat-title flex flex-col gap-2 border-b-1 border-[#eee] p-4">
                        <div className="title-wrap flex justify-between">
                          <div className="font-bold text-lg">본인</div>
                          <ul className="flex gap-1 items-center cursor-pointer">
                            <li className="w-1 h-1 rounded bg-[#7c7c7c]"></li>
                            <li className="w-1 h-1 rounded bg-[#7c7c7c]"></li>
                            <li className="w-1 h-1 rounded bg-[#7c7c7c]"></li>
                          </ul>
                        </div>
                        <div className="text-wrap">
                          <p>여기서 채팅을 테스트 해보세요</p>
                        </div>
                      </div>
                      {/* chat */}
                      <div className="flex-1 p-4 bg-blue-300">
                      채팅방
                      </div>
                      {/* input */}
                      <ChatInput />
                    </div>
                </div>
            </div>
            }
          </div>

          <ul className='grid grid-cols-2 gap-6'>
            <li className='flex items-center justify-center w-[130px] h-[130px] bg-[#60A5FA] rounded-2xl animate-swing delay-0 shadow-lg shadow-black/3'>
              <img src="/icon/video-white.svg" alt="" />
            </li>
            <li className='flex items-center justify-center w-[130px] h-[130px] bg-[#35D16E] rounded-2xl animate-swing delay-300 shadow-lg shadow-black/3'>
              <img src="/icon/security-white.svg" alt="" />
            </li>
            <li className='flex items-center justify-center w-[130px] h-[130px] bg-[#C084FC] rounded-2xl animate-swing delay-600 shadow-lg shadow-black/3'>
              <img src="/icon/security-white.svg" alt="" />
            </li>
            <li className='flex items-center justify-center w-[130px] h-[130px] bg-[#F97E23] rounded-2xl animate-swing delay-900 shadow-lg shadow-black/3'>
              <img src="/icon/video-white.svg" alt="" />
            </li>
          </ul>
      </div>
    )
}