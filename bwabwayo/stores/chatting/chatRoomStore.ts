import { create } from 'zustand'
import { Client, Stomp } from '@stomp/stompjs'
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
    isRead: boolean
    createdAt: Date
    type: string
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

    getRoomList: () => {
        console.log('🔍 getRoomList 함수 호출됨');
        const serverUrl = 'https://i13e202.p.ssafy.io/be/ws-stomp'
        
        try {
            console.log('STOMP 연결 시도 (채팅방 목록):', serverUrl)
            
            // SockJS 사용
            const socket = new SockJS(serverUrl)
            
            // Stomp.over 방식으로 변경 (예시 코드와 동일하게)
            const stompClient = Stomp.over(socket)
            
            // 연결 성공
            stompClient.connect({}, function () {
                console.log("✅ 웹소켓 연결 성공");
                
                // 연결 상태 업데이트
                set({ isConnected: true, stompClient: stompClient })
                
                // 토큰에서 사용자 ID 추출
                const token = localStorage.getItem('accessToken')
                console.log('🔍 토큰 확인:', token ? '토큰 있음' : '토큰 없음');
                
                if (token) {
                    try {
                        const payload = JSON.parse(atob(token.split('.')[1]))
                        const myUserId = payload.sub
                        console.log('🔍 추출된 사용자 ID:', myUserId);
                        
                        console.log(`📡 채팅방 목록 구독 시작 (사용자: ${myUserId})`)
                        
                        // 내 채팅방 목록 구독 (예시 코드와 동일한 방식)
                        stompClient.subscribe(`/sub/chat/roomlist/${myUserId}`, function (output: any) {
                            console.log("📨 원시 메시지 수신:", output);
                            console.log("📨 메시지 바디:", output.body);
                            
                            try {
                                const roomList = JSON.parse(output.body);
                                console.log("📥 채팅방 목록 수신:", roomList);
                                
                                // 받은 데이터를 ChatRoom 형식으로 변환
                                const formattedRoomList = roomList.map((room: any) => ({
                                    roomId: room.roomId,
                                    productName: room.productName,
                                    partnerNickName: room.partnerNickName,
                                    partnerId: room.partnerId,
                                    lastChatmessageDto: room.lastChatmessageDto,
                                    unreadMessagesNum: room.unreadMessagesNum || 0,
                                    lastMessageContent: room.lastChatmessageDto?.content || '',
                                    lastMessageTime: room.lastChatmessageDto?.createdAt || '',
                                    type: room.lastChatmessageDto?.type || 'TEXT',
                                    seller: {
                                        id: room.sellerId,
                                        nickname: room.partnerNickName || '판매자'
                                    },
                                    product: {
                                        id: room.productId,
                                        thumnail: room.productThumbnail || ''
                                    }
                                }))
                                
                                // 채팅방 목록 상태 업데이트
                                set({ roomList: formattedRoomList })
                                
                                // updateRoomList와 동일한 기능
                                console.log('🔔 채팅방 목록 업데이트 완료')
                                formattedRoomList.forEach((room: ChatRoom) => {
                                    console.log(`[${room.productName}] ${room.partnerNickName}: ${room.lastChatmessageDto?.content || '메시지 없음'}`)
                                })
                            } catch (error) {
                                console.error('❌ 채팅방 목록 파싱 실패:', error);
                                console.error('❌ 원시 데이터:', output.body);
                            }
                        });
                        
                        console.log(`✅ 채팅방 목록 구독 완료`)
                    } catch (error) {
                        console.error('토큰 파싱 실패:', error)
                    }
                }
            });
            
        } catch (error) {
            console.error('STOMP 연결 실패 (채팅방 목록):', error)
            set({ isConnected: false })
        }
    },

    connectStomp: (roomId?: number) => {
        const serverUrl = 'https://i13e202.p.ssafy.io/be/ws-stomp'
        
        try {
            console.log('STOMP 연결 시도:', serverUrl)
            if (roomId) {
                console.log('📡 구독할 채팅방:', roomId)
            }
            
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
                
                // roomId가 있으면 해당 채팅방 구독
                if (roomId) {
                    console.log(`📡 채팅방 ${roomId} 구독 시작`)
                    client.subscribe(`/sub/chat/room/${roomId}`, (messageOutput) => {
                        const msg = JSON.parse(messageOutput.body)
                        console.log('📨 받은 메시지:', msg)
                        
                        // localStorage에서 토큰 가져오기
                        const token = localStorage.getItem('accessToken')
                        const isMine = msg.senderId === token
                        
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
        
        // 중복 메시지 체크 (같은 내용, 같은 시간, 같은 발신자)
        const existingMessage = get().messages.find(existing => 
            existing.content === msg.content && 
            existing.senderId === msg.senderId &&
            Math.abs(new Date(existing.createdAt).getTime() - new Date(msg.createdAt).getTime()) < 1000 // 1초 이내
        )
        
        if (existingMessage) {
            console.log('⚠️ 중복 메시지 감지, 추가하지 않음:', msg.content)
            return
        }
        
        // 새 메시지를 기존 메시지 배열에 추가
        set(state => ({ 
            messages: [...state.messages, msg] 
        }))
        
        console.log('✅ 메시지 추가 완료. 총 메시지 개수:', get().messages.length)
        console.log('📋 현재 모든 메시지:', get().messages)
    }
}))