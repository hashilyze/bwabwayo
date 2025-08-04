import { create } from 'zustand'
import { useAuthStore } from '@/stores/auth/authStore'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import * as Stomp from '@stomp/stompjs'

interface RoomInfo {
    roomId: number
    buyerId: string
    sellerId: string
    productId: number
}

interface addRoom{
    sellerId: string
    productId: number
}

interface ChatMessage {
    roomId: number
    senderId: string
    receiverId: string
    content: string
    isRead: boolean
    createdAt: Date
    type: string
}

interface ChatRoomStore{
    roomInfo: RoomInfo[]
    messages: ChatMessage[]
    stompClient: Client | null
    isConnected: boolean
    addChatRoom: (addRoom: addRoom) => Promise<RoomInfo | null>
    getChatMessages: (roomId: number) => Promise<ChatMessage[]>
    sendMessage: (message: ChatMessage) => Promise<void>
    connectStomp: () => void
    disconnectStomp: () => void
    appendSystemMessage: (message: string) => void
}

const baseUrl = 'https://i13e202.p.ssafy.io/be/api'

export const useChatRoomStore = create<ChatRoomStore>((set, get) => ({
    roomInfo: [],
    messages: [],
    stompClient: null,
    isConnected: false,
    
    addChatRoom: async (addRoom: addRoom) => {
        try{
            const response = await useAuthStore.getState().authenticatedFetch(`${baseUrl}/chatrooms`, {
                method: 'POST',
                body: JSON.stringify(addRoom),
            })
            const data = await response.json()
            console.log(data)
            
            let roomInfo: RoomInfo | null = null;
            
            // data가 객체인 경우 배열로 변환하여 저장
            if (data && typeof data === 'object' && !Array.isArray(data)) {
                set({ roomInfo: [data] })
                roomInfo = data as RoomInfo;
            } else if (Array.isArray(data)) {
                set({ roomInfo: data })
                roomInfo = data[0] as RoomInfo;
            } else {
                console.error('예상치 못한 응답 형태:', data)
                set({ roomInfo: [] })
            }
            
            return roomInfo;
        }
        catch (error) {
            console.error('Error adding chat room:', error)
            return null;
        }
    },

    getChatMessages: async (roomId: number) => {
        try {
            // 실제 API 호출 (현재는 주석 처리)
            // const response = await useAuthStore.getState().authenticatedFetch(`${baseUrl}/chatrooms/${roomId}/messages`)
            // const data = await response.json()
            // console.log('채팅 메시지 조회:', data)
            
            // 테스트용 더미 메시지 데이터
            const dummyMessages: ChatMessage[] = [
                {
                    roomId: roomId,
                    senderId: '4375461526', // 판매자
                    receiverId: '4375126834', // 구매자
                    content: '안녕하세요! 상품에 대해 궁금한 점이 있으시면 언제든 문의해주세요.',
                    isRead: true,
                    createdAt: new Date(Date.now() - 3600000), // 1시간 전
                    type: "TEXT"
                },
                {
                    roomId: roomId,
                    senderId: '4375126834', // 구매자
                    receiverId: '4375461526', // 판매자
                    content: '네, 안녕하세요! 상품 상태가 어떤가요?',
                    isRead: true,
                    createdAt: new Date(Date.now() - 1800000), // 30분 전
                    type: "TEXT"
                },
                {
                    roomId: roomId,
                    senderId: '4375461526', // 판매자
                    receiverId: '4375126834', // 구매자
                    content: '상품 상태는 매우 좋습니다. 거의 새것과 같아요!',
                    isRead: true,
                    createdAt: new Date(Date.now() - 900000), // 15분 전
                    type: "TEXT"
                }
            ];
            
            console.log('더미 메시지 로드:', dummyMessages);
            set({ messages: dummyMessages })
            return dummyMessages;
            
            // 실제 API 응답 처리 (주석 처리)
            // if (data && Array.isArray(data)) {
            //     set({ messages: data })
            //     return data
            // } else {
            //     console.error('예상치 못한 메시지 응답 형태:', data)
            //     set({ messages: [] })
            //     return []
            // }
        } catch (error) {
            console.error('Error getting chat messages:', error)
            return []
        }
    },

    sendMessage: async (message: ChatMessage) => {
        try {
            const response = await useAuthStore.getState().authenticatedFetch(`${baseUrl}/chatrooms/messages`, {
                method: 'POST',
                body: JSON.stringify(message),
            })
            const data = await response.json()
            console.log('메시지 전송 성공:', data)
            
            // 새 메시지를 기존 메시지 배열에 추가
            set(state => ({ 
                messages: [...state.messages, message] 
            }))
        } catch (error) {
            console.error('Error sending message:', error)
        }
    },

    connectStomp: () => {
        const serverUrl = 'https://i13e202.p.ssafy.io/be/ws-stomp'
        
        try {
            console.log('STOMP 연결 시도:', serverUrl)
            
            // SockJS 사용
            const socket = new SockJS(serverUrl)
            
            // STOMP 클라이언트 생성
            const client = new Client({
                webSocketFactory: () => socket,
                debug: (str) => {
                    console.log('STOMP Debug:', str)
                },
                reconnectDelay: 0,
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000
            })
            
            // 연결 성공
            client.onConnect = (frame) => {
                console.log('✅ STOMP 연결 성공!')
                console.log('연결된 서버:', serverUrl)
                console.log('연결 데이터:', frame)
                
                // 연결 상태 업데이트
                set({ isConnected: true, stompClient: client })
                
                // 시스템 메시지 추가
                get().appendSystemMessage("✅ 연결되었습니다.")
                
                // 기본 구독 (roomId는 나중에 설정)
                // client.subscribe(`/sub/chat/room/${roomId}`, (messageOutput) => {
                //     const msg = JSON.parse(messageOutput.body)
                //     console.log('받은 메시지:', msg)
                // })
            }
            
            // 연결 오류
            client.onStompError = (frame) => {
                console.error('❌ STOMP 연결 실패')
                console.error('서버 URL:', serverUrl)
                console.error('에러 메시지:', frame)
                set({ isConnected: false })
                
                // 시스템 메시지 추가
                get().appendSystemMessage("❌ 연결에 실패했습니다.")
            }
            
            // 연결 시작
            client.activate()
            
        } catch (error) {
            console.error('STOMP 연결 실패:', error)
            set({ isConnected: false })
            get().appendSystemMessage("❌ 연결에 실패했습니다.")
        }
    },

    disconnectStomp: () => {
        const { stompClient } = get()
        if (stompClient) {
            stompClient.deactivate()
            set({ stompClient: null, isConnected: false })
        }
    },

    appendSystemMessage: (message: string) => {
        console.log('시스템 메시지:', message)
        // 여기에 실제 메시지 추가 로직을 구현할 수 있습니다
        // 예: 채팅 UI에 시스템 메시지 표시
    }
}))