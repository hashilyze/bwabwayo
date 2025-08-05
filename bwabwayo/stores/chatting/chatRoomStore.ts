import { create } from 'zustand'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useAuthStore } from '../auth/authStore'

interface RoomInfo {
    roomId: number
    buyerId: string
    sellerId: string
    productId: number
}

interface addRoom {
    sellerId: string
    productId: number
}

interface ChatMessage {
    productId: number
    productTitle: string
    productPrice: number
    productImageUrl: string
    buyerId: number
    sellerId: number
    type: string
    senderId: number
    token?: string
    content: string
    createdAt: string
    isRead: boolean
}

interface ChatRoom {
    roomId: number
    productName: string
    partnerNickName: string
    partnerId: string
    lastChatmessageDto: {
        content: string
        createdAt: string
        type: string
    }
    unreadMessagesNum: number
    lastMessageContent: string
    lastMessageTime: string
    type: string
    seller: {
        id: number
        nickname: string
    }
    product: {
        id: number
        thumnail: string
    }
}

interface ChatRoomStore{
    roomInfo: RoomInfo[]
    roomList: ChatRoom[]
    messages: ChatMessage[]
    stompClient: Client | null
    isConnected: boolean
    addChatRoom: (addRoom: addRoom) => Promise<RoomInfo | null>
    getRoomInfo: (roomId: number) => Promise<RoomInfo | null>
    getRoomList: () => void
    connectStomp: (roomId?: number) => void
    disconnectStomp: () => void
    appendMessage: (msg: ChatMessage, isMine: boolean) => void
    clearMessages: () => void
    getMessageHistory: (roomId: number) => Promise<void>
    sendMessage: (roomId: number, content: string) => void
}

export const useChatRoomStore = create<ChatRoomStore>((set, get) => ({
    roomInfo: [],
    roomList: [],
    messages: [],
    stompClient: null,
    isConnected: false,

    addChatRoom: async (addRoom: addRoom) => {
        try{
            const response = await useAuthStore.getState().authenticatedFetch(`https://i13e202.p.ssafy.io/be/api/chatrooms`, {
                method: 'POST',
                body: JSON.stringify(addRoom),
            })
            const data = await response.json()
            console.log(data)
            set({ roomInfo: data })
            return data as RoomInfo
        }
        catch (error) {
            console.error('Error adding chat room:', error)
            return null;
        }
    },

    getRoomInfo: async (roomId: number) => {
        try {
            const response = await useAuthStore.getState().authenticatedFetch(`https://i13e202.p.ssafy.io/be/api/chatrooms/${roomId}`)
            const data = await response.json()
            set({ roomInfo: [data] })
            return data as RoomInfo
        } catch (error) {
            console.error('Error getting room info:', error)
            return null;
        }
    },

    getRoomList: async () => {
        try{
            const response = await useAuthStore.getState().authenticatedFetch(`https://i13e202.p.ssafy.io/be/api/chatrooms`)
            const data = await response.json()
            set({ roomList: data })
            return data as ChatRoom[]
        } catch (error) {
            console.error('Error getting room list:', error)
            return null;
        }
    },

    connectStomp: (roomId?: number) => {
        const serverUrl = 'https://i13e202.p.ssafy.io/be/ws-stomp'
        
        try {
            console.log('STOMP 연결 시도:', serverUrl)

            const socket = new SockJS(serverUrl)
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
                
                // roomId가 있으면 해당 채팅방 구독
                if (roomId) {
                    console.log(`📡 채팅방 ${roomId} 구독 시작`)
                    client.subscribe(`/sub/chat/room/${roomId}`, (messageOutput) => {
                        const msg = JSON.parse(messageOutput.body)
                        console.log('📨 받은 메시지:', msg)
                        
                        // 현재 사용자의 토큰
                        const myToken = localStorage.getItem('accessToken')
                        
                        // 내가 보낸 메시지인지 판단 (토큰 비교)
                        const isMine = Boolean(myToken && msg.token === myToken)
                        console.log('👤 메시지 발신자:', isMine ? '나' : '상대')
                        console.log('📝 메시지 내용:', msg.content)
                        
                        // appendMessage를 통해 메시지 추가
                        get().appendMessage(msg, isMine)
                    })
                    console.log(`✅ 채팅방 ${roomId} 구독 완료`)
                }
            }
            
            // 연결 오류
            client.onStompError = (error) => {
                console.error('에러 메시지:', error)
                set({ isConnected: false })
            }
            
            // 연결 시작
            client.activate()
            
        } catch (error) {
            console.error('STOMP 연결 실패:', error)
            set({ isConnected: false })
        }
    },

    disconnectStomp: () => {
        const { stompClient } = get()
        if (stompClient) {
            stompClient.deactivate()
            set({ stompClient: null, isConnected: false })
        }
    },

    appendMessage: (msg: ChatMessage, isMine: boolean) => {
        console.log('📨 새 메시지 추가 시도:', msg)
        console.log('👤 발신자:', isMine ? '나' : '상대')
        console.log('📋 현재 메시지 개수:', get().messages.length)
        
        // 새 메시지를 기존 메시지 배열에 추가
        set(state => ({ 
            messages: [...state.messages, msg] 
        }))
        
        console.log('✅ 메시지 추가 완료. 총 메시지 개수:', get().messages.length)
        console.log('📋 현재 모든 메시지:', get().messages)
    },

    clearMessages: () => {
        console.log('🗑️ 메시지 목록 초기화');
        set({ messages: [] });
    },

    getMessageHistory: async (roomId: number) => {
        try {
            const response = await useAuthStore.getState().authenticatedFetch(`https://i13e202.p.ssafy.io/be/api/chatrooms/${roomId}?page=0`);
            const data = await response.json();
            console.log('📥 메시지 히스토리 수신:', data);
            
            set({ messages: data as ChatMessage[] })
        } catch (error) {
            console.error(`❌ 채팅방 ${roomId} 메시지 히스토리 로드 실패:`, error);
        }
    },

    sendMessage: (roomId: number, content: string) => {
        const { stompClient, isConnected } = get()
        
        if (!stompClient || !isConnected) {
            console.error('❌ STOMP 클라이언트가 연결되지 않았습니다.')
            return
        }

        if (!content.trim()) {
            console.warn('⚠️ 빈 메시지는 전송할 수 없습니다.')
            return
        }

        try {
            // 토큰 가져오기
            const token = localStorage.getItem('accessToken')
            
            if (!token) {
                console.error('❌ 토큰을 찾을 수 없습니다.')
                return
            }

            // 메시지 객체 생성 (토큰 포함)
            const message = {
                roomId: roomId,
                token: token,
                content: content.trim(),
                type: 'TALK'
            }

            console.log('📤 메시지 전송 시도:', message)
            
            // STOMP를 통해 메시지 전송
            stompClient.publish({
                destination: `/pub/chat/message`,
                body: JSON.stringify(message)
            })

            console.log('✅ 메시지 전송 완료')
            
        } catch (error) {
            console.error('❌ 메시지 전송 실패:', error)
        }
    },

}))