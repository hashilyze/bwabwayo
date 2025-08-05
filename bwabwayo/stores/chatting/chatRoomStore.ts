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

interface Buyer{
    id: number
    nickname: string
    profileImageUrl: string
}

interface LastMessage{
    content: string
    createdAt: string
    isRead: boolean
    receiverId: number
    roomId: number
    senderId: number
    type: string
}

interface Seller{
    avgRating: number
    dealCount: number
    id: number
    nickname: string
    profileImageUrl: string
    reviewCount: number
}

interface Product{
    canDelivery: boolean
    canDirect: boolean
    canNegotiate: boolean
    id: number
    imageUrl: string
    price: number
    saleStatus: string
    shippingFee: number
    title: string
}

interface ChatRoom {
    buyer: Buyer
    lastMessage: LastMessage
    partnerNickName: string
    product: Product
    roomId: number
    seller: Seller
    unreadCount: number
    userId: number
    userNickname: string
}

interface ChatRoomStore{
    roomInfo: RoomInfo[]
    roomList: ChatRoom[]
    messages: ChatMessage[]
    stompClient: Client | null
    isConnected: boolean
    isConnecting: boolean
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
    isConnecting: false,

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
            console.log(data)
            set({ roomList: data })
        } catch (error) {
            console.error('Error getting room list:', error)
        }
    },

    connectStomp: (roomId?: number) => {
        // 이미 연결되었거나 연결 중이면 중복 실행 방지
        if (get().isConnected || get().isConnecting) {
            console.log('STOMP: 이미 연결되었거나 연결이 진행 중입니다.');
            return;
        }

        // 연결 시작 상태로 설정
        set({ isConnecting: true });
        
        const serverUrl = 'https://i13e202.p.ssafy.io/be/ws-stomp'
        
        try {
            console.log('STOMP: 연결 시도...');

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
            
            client.onConnect = (frame) => {
                console.log('✅ STOMP: 연결 성공!')
                set({ isConnected: true, isConnecting: false, stompClient: client })
                
                if (roomId) {
                    console.log(`📡 STOMP: 채팅방 ${roomId} 구독 시작`)
                    client.subscribe(`/sub/chat/room/${roomId}`, (messageOutput) => {
                        const msg = JSON.parse(messageOutput.body)
                        get().appendMessage(msg, false) // isMine은 appendMessage에서 결정하도록 변경 가능
                    })
                }
            }
            
            client.onStompError = (error) => {
                console.error('❌ STOMP: 연결 오류', error)
                set({ isConnected: false, isConnecting: false, stompClient: null })
            }
            
            client.activate()
            
        } catch (error) {
            console.error('❌ STOMP: 연결 설정 실패', error)
            set({ isConnected: false, isConnecting: false })
        }
    },

    disconnectStomp: () => {
        const { stompClient } = get()
        if (stompClient) {
            console.log('STOMP: 연결 해제 시도...');
            stompClient.deactivate()
        }
        set({ stompClient: null, isConnected: false, isConnecting: false })
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
                // 객체인 경우 다양한 필드명 시도
                const possibleMessageFields = ['messages', 'content', 'data', 'items', 'chatMessages', 'messageList'];
                
                for (const field of possibleMessageFields) {
                    if (Array.isArray(data[field])) {
                        console.log(`✅ 메시지 배열을 찾았습니다: ${field}`);
                        messagesArray = data[field].filter((item: any) => 
                            item && 
                            typeof item === 'object' && 
                            item.content !== undefined
                        );
                        break;
                    }
                }
                
                // 만약 배열 필드를 찾지 못했다면, 객체 자체가 메시지일 수 있음
                if (messagesArray.length === 0 && data.content !== undefined) {
                    console.log('✅ 단일 메시지 객체로 처리');
                    messagesArray = [data as ChatMessage];
                }
                
                if (messagesArray.length === 0) {
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
            // URL 파라미터에서 sellerId와 buyerId 가져오기
            const urlParams = new URLSearchParams(window.location.search)
            const sellerId = urlParams.get('sellerId')
            const buyerId = urlParams.get('buyerId')
            
            if (!sellerId || !buyerId) {
                console.error('❌ URL 파라미터에서 sellerId 또는 buyerId를 찾을 수 없습니다.')
                return
            }

            // URL 파라미터에서 senderId와 receiverId 결정
            // 현재 사용자가 판매자인지 구매자인지 판단
            const currentUserId = sellerId // 임시로 sellerId를 현재 사용자로 설정
            const isSeller = currentUserId === sellerId
            const senderId = currentUserId
            const receiverId = isSeller ? buyerId : sellerId

            // STOMP 메시지 형식
            const stompMessage = {
                roomId: roomId,
                senderId: senderId,
                receiverId: receiverId,
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