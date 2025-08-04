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
    currentRoomId: number | null
    stompClient: Client | null
    isConnected: boolean
    addChatRoom: (addRoom: addRoom) => Promise<RoomInfo | null>
    getRoomInfo: (roomId: number) => Promise<RoomInfo | null>
    getRoomList: () => void
    connectStomp: (roomId?: number) => void
    disconnectStomp: () => void
    appendMessage: (msg: ChatMessage, isMine: boolean) => void
    loadChatHistory: (roomId: number) => Promise<void>
    clearMessages: () => void
    setCurrentRoomId: (roomId: number | null) => void
}

export const useChatRoomStore = create<ChatRoomStore>((set, get) => ({
    roomInfo: [],
    roomList: [],
    messages: [],
    currentRoomId: null,
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
        const serverUrl = 'https://i13e202.p.ssafy.io/be/ws-stomp'
        
        try {
            const socket = new SockJS(serverUrl)
            const client = new Client({
                webSocketFactory: () => socket,
                debug: (str) => {
                    console.log('STOMP Debug (채팅방 목록):', str)
                },
                reconnectDelay: 0,
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000
            })
            
            client.onConnect = (frame) => {
                // 연결 상태 업데이트
                set({ isConnected: true, stompClient: client })
                
                // 토큰에서 사용자 ID 추출
                const token = localStorage.getItem('accessToken')
                if (token) {
                    try {
                        const payload = JSON.parse(atob(token.split('.')[1]))
                        const myUserId = payload.sub || payload.userId || payload.id
                        console.log('🔍 채팅방 목록 - 토큰에서 추출한 사용자 ID:', myUserId)

                        // 채팅방 목록 구독
                        client.subscribe(`/sub/chat/roomlist/${myUserId}`, (messageOutput) => {
                            const roomList = JSON.parse(messageOutput.body)
                            console.log('📥 채팅방 목록 수신:', roomList)
                            
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
                            
                            // 채팅방 목록 표시 (updateRoomList와 동일한 기능)
                            console.log('🔔 채팅방 목록 업데이트 완료')
                            formattedRoomList.forEach((room: ChatRoom) => {
                                console.log(`[${room.productName}] ${room.partnerNickName}: ${room.lastChatmessageDto?.content || '메시지 없음'}`)
                            })
                        })
                        
                        console.log(`✅ 채팅방 목록 구독 완료`)
                    } catch (error) {
                        console.error('토큰 파싱 실패:', error)
                    }
                }
            }
            
            // 연결 오류
            client.onStompError = (error) => {
                console.error('❌ STOMP 연결 실패 (채팅방 목록):', error)
                set({ isConnected: false })
            }
            
            // 연결 시작
            client.activate()
            
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
                        
                        // 토큰에서 사용자 ID 추출
                        const token = localStorage.getItem('accessToken')
                        let myUserId = null
                        
                        if (token) {
                            try {
                                // JWT 토큰 디코딩
                                const payload = JSON.parse(atob(token.split('.')[1]))
                                myUserId = payload.sub || payload.userId || payload.id
                                console.log('🔍 토큰에서 추출한 사용자 ID:', myUserId)
                            } catch (error) {
                                console.error('토큰 파싱 실패:', error)
                            }
                        }
                        
                        // 내가 보낸 메시지인지 판단
                        const isMine = myUserId && msg.senderId === myUserId
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
        const { currentRoomId } = get();
        console.log('📨 새 메시지 추가 시도:', msg)
        console.log('👤 발신자:', isMine ? '나' : '상대')
        console.log('🏠 현재 채팅방:', currentRoomId)
        console.log('📋 현재 메시지 개수:', get().messages.length)
        
        // 현재 채팅방의 메시지만 추가
        if (currentRoomId && msg.roomId !== currentRoomId) {
            console.log('⚠️ 다른 채팅방 메시지, 추가하지 않음:', msg.roomId, 'vs', currentRoomId)
            return
        }
        
        // 더 엄격한 중복 메시지 체크
        const existingMessage = get().messages.find(existing => 
            existing.content === msg.content && 
            existing.senderId === msg.senderId &&
            existing.roomId === msg.roomId &&
            Math.abs(new Date(existing.createdAt).getTime() - new Date(msg.createdAt).getTime()) < 2000 // 2초 이내
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
    },

    loadChatHistory: async (roomId: number) => {
        try {
            console.log(`📚 채팅방 ${roomId} 메시지 히스토리 로드 시작`);
            
            // 기존 메시지 초기화
            set({ messages: [] });
            
            // API로 채팅 히스토리 요청
            const response = await useAuthStore.getState().authenticatedFetch(
                `https://i13e202.p.ssafy.io/be/api/chatrooms/${roomId}/messages`
            );
            
            if (response.ok) {
                const chatHistory = await response.json();
                console.log(`📥 채팅방 ${roomId} 히스토리 수신:`, chatHistory);
                
                // 받은 메시지들을 ChatMessage 형식으로 변환
                const formattedMessages: ChatMessage[] = chatHistory.map((msg: any) => ({
                    roomId: msg.roomId,
                    senderId: msg.senderId,
                    receiverId: msg.receiverId,
                    content: msg.content,
                    isRead: msg.isRead,
                    createdAt: new Date(msg.createdAt),
                    type: msg.type || 'TEXT'
                }));
                
                // 메시지들을 시간순으로 정렬
                const sortedMessages = formattedMessages.sort((a, b) => 
                    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                );
                
                set({ messages: sortedMessages });
                console.log(`✅ 채팅방 ${roomId} 히스토리 로드 완료: ${sortedMessages.length}개 메시지`);
                
                // 각 메시지의 발신자 판단하여 로깅
                const token = localStorage.getItem('accessToken');
                let myUserId = null;
                
                if (token) {
                    try {
                        const payload = JSON.parse(atob(token.split('.')[1]));
                        myUserId = payload.sub || payload.userId || payload.id;
                    } catch (error) {
                        console.error('토큰 파싱 실패:', error);
                    }
                }
                
                sortedMessages.forEach((msg, index) => {
                    const isMine = myUserId && msg.senderId === myUserId;
                    console.log(`${index + 1}. ${isMine ? '나' : '상대'}: ${msg.content}`);
                });
                
            } else {
                console.error(`❌ 채팅방 ${roomId} 히스토리 로드 실패:`, response.status);
            }
        } catch (error) {
            console.error(`❌ 채팅방 ${roomId} 히스토리 로드 중 오류:`, error);
        }
    },

    clearMessages: () => {
        console.log('🗑️ 메시지 목록 초기화');
        set({ messages: [] });
    },

    setCurrentRoomId: (roomId: number | null) => {
        console.log(`🏠 현재 채팅방 설정: ${roomId}`);
        set({ currentRoomId: roomId });
    }
}))