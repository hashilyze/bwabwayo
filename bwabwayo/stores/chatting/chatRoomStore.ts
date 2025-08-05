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
    roomId: number
    senderId: string
    receiverId: string
    content: string
    type: string
    createdAt: string
    isRead: boolean
    // 기존 필드들 (호환성을 위해 유지)
    productId?: number
    productTitle?: string
    productPrice?: number
    productImageUrl?: string
    buyerId?: number
    sellerId?: number
    token?: string
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
    messages: [] as ChatMessage[],
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
                        
                        // 내가 보낸 메시지인지 판단 (senderId와 토큰/사용자 ID 비교)
                        let isMine = false
                        if (myToken) {
                            // 토큰에서 사용자 ID 추출
                            try {
                                const tokenParts = myToken.split('.')
                                if (tokenParts.length === 3) {
                                    const payload = JSON.parse(atob(tokenParts[1]))
                                    const myUserId = payload.sub || payload.userId || payload.id
                                    isMine = String(msg.senderId) === String(myUserId) || String(msg.senderId) === myToken
                                } else {
                                    isMine = String(msg.senderId) === myToken
                                }
                            } catch (error) {
                                isMine = String(msg.senderId) === myToken
                            }
                        }
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
        
        // 새 메시지를 기존 메시지 배열에 추가 (안전한 처리)
        set(state => {
            const currentMessages = Array.isArray(state.messages) ? state.messages : []
            return { 
                messages: [...currentMessages, msg] 
            }
        })
        
        console.log('✅ 메시지 추가 완료. 총 메시지 개수:', get().messages.length)
        console.log('📋 현재 모든 메시지:', get().messages)
    },

    clearMessages: () => {
        console.log('🗑️ 메시지 목록 초기화');
        set({ messages: [] as ChatMessage[] });
    },

    getMessageHistory: async (roomId: number) => {
        try {
            const response = await useAuthStore.getState().authenticatedFetch(`https://i13e202.p.ssafy.io/be/api/chatrooms/${roomId}?page=0`);
            const data = await response.json();
            console.log('📥 메시지 히스토리 수신:', data);
            console.log('📋 데이터 타입:', typeof data);
            console.log('📋 배열 여부:', Array.isArray(data));
            console.log('📋 데이터 길이:', Array.isArray(data) ? data.length : 'N/A');
            
            // 데이터 구조 확인 및 안전한 처리
            let messagesArray: ChatMessage[] = [];
            
            if (Array.isArray(data)) {
                // 배열인 경우 유효한 메시지 객체만 필터링
                messagesArray = data.filter((item: any) => 
                    item && 
                    typeof item === 'object' && 
                    item.content !== undefined
                );
            } else if (data && typeof data === 'object') {
                // 만약 data가 객체이고 messages 필드가 있다면
                if (Array.isArray(data.messages)) {
                    messagesArray = data.messages.filter((item: any) => 
                        item && 
                        typeof item === 'object' && 
                        item.content !== undefined
                    );
                } else if (Array.isArray(data.content)) {
                    messagesArray = data.content.filter((item: any) => 
                        item && 
                        typeof item === 'object' && 
                        item.content !== undefined
                    );
                } else {
                    console.warn('⚠️ 예상하지 못한 데이터 구조:', data);
                    messagesArray = [];
                }
            } else {
                console.warn('⚠️ 메시지 데이터가 배열이 아닙니다:', data);
                messagesArray = [];
            }
            
            console.log('📋 최종 처리된 메시지 배열:', messagesArray);
            set({ messages: messagesArray })
        } catch (error) {
            console.error(`❌ 채팅방 ${roomId} 메시지 히스토리 로드 실패:`, error);
            set({ messages: [] });
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

            // STOMP 메시지 형식
            const stompMessage = {
                roomId: roomId,
                senderId: null,
                receiverId: null,
                content: content.trim(),
                isRead: false,
                createdAt: new Date(),
                type: "TEXT"
            }

            console.log('📤 STOMP 메시지 전송 시도:', stompMessage)
            
            // STOMP를 통해 메시지 전송
            stompClient.publish({
                destination: "/pub/chat/message",
                body: JSON.stringify(stompMessage)
            })

            console.log('✅ STOMP 메시지 전송 완료')            
        } catch (error) {
            console.error('❌ 메시지 전송 실패:', error)
        }
    },

}))