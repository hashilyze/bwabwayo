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
    currentSelectedRoom: ChatRoom | null
    // 화상채팅 관련 상태
    isVideoChatOpen: boolean
    videoRoomId: number | null
    videoSessionId: string | null  // 세션ID 저장용
    // 거래 가격 관련 상태
    finalPrice: number | null
    setFinalPrice: (price: number | null) => void
    addChatRoom: (addRoom: addRoom) => Promise<RoomInfo | null>
    getRoomInfo: (roomId: number) => Promise<RoomInfo | null>
    getRoomList: () => void
    setCurrentSelectedRoom: (room: ChatRoom | null) => void
    connectStomp: (roomId?: number) => void
    disconnectStomp: () => void
    appendMessage: (msg: ChatMessage, isMine: boolean) => void
    clearMessages: () => void
    // 화상채팅 관련 액션
    openVideoChat: (roomId: number) => void
    closeVideoChat: () => void
    getMessageHistory: (roomId: number) => Promise<void>
    sendMessage: (roomId: number, content: string, type?: string) => void
    setVideoSessionId: (id: string | null) => void
    // 화상채팅 세션 생성 함수 추가
    createVideoSession: (roomId: number) => Promise<string | null>
      // 채팅방 목록 업데이트 함수 추가
    updateRoomList: (newRoomList: ChatRoom[]) => void
}

export const useChatRoomStore = create<ChatRoomStore>((set, get) => ({
    roomInfo: [],
    roomList: [],
    messages: [] as ChatMessage[],
    stompClient: null,
    isConnected: false,
    isConnecting: false,
    currentSelectedRoom: null,
    // 화상채팅 관련 상태
    isVideoChatOpen: false,
    videoRoomId: null,
    videoSessionId: null,  // 세션ID 저장용
    // 거래 가격 관련 상태
    finalPrice: null,
    setFinalPrice: (price: number | null) => set({ finalPrice: price }),
    setVideoSessionId: (id: string | null) => set({ videoSessionId: id }),

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

    setCurrentSelectedRoom: (room: ChatRoom | null) => {
        set({ currentSelectedRoom: room });
    },

    connectStomp: (roomId?: number) => {
        // 이미 연결되었거나 연결 중이면 중복 실행 방지
        if (get().isConnected || get().isConnecting) {
            // console.log('STOMP: 이미 연결되었거나 연결이 진행 중입니다.');
            return;
        }

        // 연결 시작 상태로 설정
        set({ isConnecting: true });
        
        const serverUrl = 'https://i13e202.p.ssafy.io/be/ws-stomp'
   
        //const accessToken = localStorage.getItem('accessToken')
        const accessToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzM4NCJ9.eyJzdWIiOiI0Mzc1MTI2ODM0Iiwicm9sZSI6IlVTRVIiLCJ0b2tlblR5cGUiOiJhY2Nlc3MiLCJpYXQiOjE3NTQzMjk4OTEsImV4cCI6MzMyNDY3OTM4OTF9.Ri8aEdsV2_37aZ9As4npi_kBvWv0ccQlUzyKweE4B-opos4h-4Ceb7OO4LQUFJp7'
  
        try {
            const socket = new SockJS(serverUrl)
            const client = new Client({
                webSocketFactory: () => socket,
                connectHeaders: {
                    Authorization: `Bearer ${accessToken}`,
                },
                reconnectDelay: 0,
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000,
                });

            client.onConnect = (frame) => {
                // console.log('✅ STOMP: 연결 성공!')
                set({ isConnected: true, isConnecting: false, stompClient: client })
                
                // console.log('📡 STOMP: 채팅방 목록(/user/chat/roomlist) 구독 시작');
                client.subscribe('/user/sub/chat/roomlist', (messageOutput) => {
                    try {
                        // console.log(messageOutput.body)
                        const updatedRoomList = JSON.parse(messageOutput.body) as ChatRoom[];
                        console.log('📋 채팅방 목록 업데이트 수신:', updatedRoomList);
                        get().updateRoomList(updatedRoomList);
                    } catch (error) {
                        console.error('❌ 채팅방 목록 파싱 오류:', error);
                    }
                });


                if (roomId) {
                    console.log(`📡 STOMP: 채팅방 ${roomId} 구독 시작`)
                    client.subscribe(`/sub/chat/room/${roomId}`, (messageOutput) => {
                        const msg = JSON.parse(messageOutput.body)
                        console.log('📨 메시지 수신:', msg.type, msg.content);
                        
                        // START_VIDEOCALL 타입 메시지인 경우 세션ID 저장
                        if (msg.type === 'START_VIDEOCALL' && msg.content) {
                            console.log('📹 화상채팅 세션ID 저장:', msg.content);
                            set({ videoSessionId: msg.content });
                        }
                        
                        // 메시지 추가 (실시간 업데이트)
                        get().appendMessage(msg, false)
                        
                        // 메시지 수신 시 즉시 채팅방 목록 업데이트
                        get().getRoomList();
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
            stompClient.deactivate()
        }
        set({ stompClient: null, isConnected: false, isConnecting: false })
    },

    appendMessage: (msg: ChatMessage, isMine: boolean) => {        
        set(state => {
            const currentMessages = Array.isArray(state.messages) ? state.messages : []
            
            // 중복 메시지 방지: 같은 내용, 같은 시간대의 메시지는 추가하지 않음
            const isDuplicate = currentMessages.some(existingMsg => 
                existingMsg.content === msg.content && 
                existingMsg.senderId === msg.senderId &&
                Math.abs(new Date(existingMsg.createdAt).getTime() - new Date(msg.createdAt).getTime()) < 1000 // 1초 이내
            );
            
            if (isDuplicate) {
                console.log('🔄 중복 메시지 감지, 추가하지 않음:', msg.content);
                return state;
            }

            console.log('📝 새 메시지 추가 (실시간):', msg.content);
            
            // 새 메시지를 추가하고 즉시 UI 업데이트
            const updatedMessages = [...currentMessages, msg];
            
            return { 
                messages: updatedMessages 
            }
        })
    },

    clearMessages: () => {
        console.log('🗑️ 메시지 목록 초기화');
        set({ messages: [] as ChatMessage[] });
    },

    getMessageHistory: async (roomId: number) => {
        try {
            const response = await useAuthStore.getState().authenticatedFetch(`https://i13e202.p.ssafy.io/be/api/chatrooms/${roomId}?page=0`);
            const data = await response.json();
            // console.log('📥 메시지 히스토리 수신:', data);
            set({ messages: data })
        } catch (error) {
            console.error(`❌ 채팅방 ${roomId} 메시지 히스토리 로드 실패:`, error);
            set({ messages: [] });
        }
    },

    sendMessage: (roomId: number, content: string, type: string = "TEXT") => {
        return new Promise<void>((resolve, reject) => {
            const { stompClient, isConnected } = get()
            
            if (!stompClient || !isConnected) {
                console.error('❌ STOMP 클라이언트가 연결되지 않았습니다.')
                reject(new Error('STOMP 클라이언트가 연결되지 않았습니다.'))
                return
            }

            if (!content.trim()) {
                console.warn('⚠️ 빈 메시지는 전송할 수 없습니다.')
                reject(new Error('빈 메시지는 전송할 수 없습니다.'))
                return
            }

            try {
                const { currentSelectedRoom } = get();
                const currentUserId = currentSelectedRoom?.userId.toString();

                // receiverId 결정: 현재 사용자가 판매자인지 구매자인지 판단
                let receiverId = null;
                const sellerId = currentSelectedRoom?.seller.id.toString();
                const buyerId = currentSelectedRoom?.buyer.id.toString();
                
                // 현재 사용자가 판매자인 경우 구매자에게 전송
                if (currentUserId === sellerId) {
                    receiverId = buyerId;
                }
                // 현재 사용자가 구매자인 경우 판매자에게 전송
                else if (currentUserId === buyerId) {
                    receiverId = sellerId;
                }
                // 그 외의 경우 (예상치 못한 상황)
                else {
                    receiverId = sellerId;
                }

                if (!receiverId) {
                    console.error('❌ receiverId를 결정할 수 없습니다.')
                    reject(new Error('receiverId를 결정할 수 없습니다.'))
                    return
                }

                // 즉시 UI에 반영할 메시지 객체 생성
                const immediateMessage: ChatMessage = {
                    roomId: roomId,
                    senderId: currentUserId || '',
                    receiverId: receiverId || '',
                    content: content.trim(),
                    type: type,
                    createdAt: new Date().toISOString(),
                    isRead: false
                }

                // 즉시 로컬 메시지 목록에 추가 (낙관적 업데이트)
                console.log('📝 즉시 메시지 추가 (낙관적 업데이트):', immediateMessage)
                get().appendMessage(immediateMessage, true)

                // STOMP 메시지 형식
                const stompMessage = {
                    roomId: roomId,
                    senderId: currentUserId, // myUserId를 senderId로 사용
                    receiverId: receiverId,
                    content: content.trim(),
                    isRead: false,
                    createdAt: new Date(),
                    type: type
                }

                console.log('📤 STOMP 메시지 전송 시도:', stompMessage)
                
                // STOMP를 통해 메시지 전송
                stompClient.publish({
                    destination: "/pub/chat/message",
                    body: JSON.stringify(stompMessage)
                })

                console.log('✅ STOMP 메시지 전송 완료')
                
                // 메시지 전송 후 채팅방 목록도 즉시 업데이트
                setTimeout(() => {
                    get().getRoomList();
                }, 100);
                
                resolve()
            } catch (error) {
                console.error('❌ 메시지 전송 실패:', error)
                reject(error)
            }
        })
    },

    // 화상채팅 관련 함수들
    openVideoChat: (sessionId: number) => {
        console.log('📹 화상채팅 열기:', sessionId);
        set({ isVideoChatOpen: true, videoRoomId: sessionId });
    },

    closeVideoChat: () => {
        console.log('📹 화상채팅 닫기');
        set({ isVideoChatOpen: false, videoRoomId: null });
        // 세션ID는 유지 (재사용 가능)
    },

    // 화상채팅 세션 생성 함수 추가
    createVideoSession: async (roomId: number) => {
        try {
            const response = await useAuthStore.getState().authenticatedFetch(`https://i13e202.p.ssafy.io/be/api/sessions`, {
                method: 'POST',
                body: JSON.stringify({ videoRoomId: roomId }),
            });
            
            if (response.ok) {
                const sessionId = await response.text();
                console.log('✅ 화상채팅 세션 생성 성공:', sessionId);
                return sessionId;
            } else {
                console.error('❌ 화상채팅 세션 생성 실패');
                return null;
            }
        } catch (error) {
            console.error('❌ 화상채팅 세션 생성 오류:', error);
            return null;
        }
    },

    updateRoomList: (newRoomList: ChatRoom[]) => {
        console.log('📋 채팅방 목록 업데이트:', newRoomList);
        set({ roomList: newRoomList });
        
        // 현재 선택된 채팅방이 있다면 해당 정보도 업데이트
        const { currentSelectedRoom } = get();
        if (currentSelectedRoom) {
            const updatedCurrentRoom = newRoomList.find(room => room.roomId === currentSelectedRoom.roomId);
            if (updatedCurrentRoom) {
                set({ currentSelectedRoom: updatedCurrentRoom });
            }
        }
    },

}))