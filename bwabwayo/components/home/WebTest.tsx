'use client'

import { useRef, useState } from "react"
import MyVideo from "../chat/MyVideo"

export default function WebTest(){
    const [showVideo, setShowVideo] = useState(false)
    const videoRef = useRef<{ startVideo: () => void }>(null)

    const handleStart = () => {
        setShowVideo(true)
        setTimeout(() => {
        videoRef.current?.startVideo()
        }, 0)
    }

    return(
        <div className="custom-gradient rounded-lg flex gap-10 items-center px-8 py-12 relative">
        {showVideo &&
            <div
                className={`
                    absolute top-1/2 left-1/2 
                    transform -translate-x-1/2 -translate-y-1/2 
                    w-0 h-0 opacity-0 
                    bg-white rounded-xl overflow-hidden shadow-lg
                    transition-all duration-500 ease-out
                    scale-50
                    animate-show-video
                `}
                style={{
                width: '480px',
                height: '320px',
                }}
            >
                <MyVideo ref={videoRef} />
            </div>
        }
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
          <div className='bg-white cursor-pointer py-3 mt-6 rounded-lg flex items-center justify-center w-[150px] text-[#2857DB] text-md'
            onClick={handleStart}>지금 시작하기
          </div>
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