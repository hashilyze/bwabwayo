import { create } from 'zustand'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

interface Seller {
    id: number
    nickname: string
}

interface Product {
    id: number
    thumnail: string
}

interface RoomList {
    // api보고 수정 필요
    roomId: number,
    unreadMessagesNum: number,
    lastMessageContent: string,
    lastMessageTime: string,
    type: string,
    seller: Seller,
    product: Product,
}

interface RoomListStore {
  roomList: RoomList[]
  stompClient: Client | null
  isConnected: boolean
  setRoomList: () => Promise<void>
  setRoomDetail: (roomId: number) => Promise<void>
  connectStomp: () => void
  disconnectStomp: () => void
}

const DUMMY_DATA: RoomList[] = [
    {
        roomId : 1,
        unreadMessagesNum : 3,
        lastMessageContent : "감사합니다",
        lastMessageTime : "2025-07-12",
        type : "TEXT",
        seller : {
            id : 1,
            nickname : "라부부판매원",
        },
        product : {
            id : 1,
            thumnail : "url",
        }
    },
]

export const useRoomListStore = create<RoomListStore>((set, get) => ({
  roomList: [],
  stompClient: null,
  isConnected: false,

  connectStomp: () => {
    const serverUrl = 'https://i13e202.p.ssafy.io/be/ws-stomp'
    
    try {
      console.log('STOMP 연결 시도 (채팅방 목록):', serverUrl)
      
      // SockJS 사용
      const socket = new SockJS(serverUrl)
      
      // STOMP 클라이언트 생성
      const client = new Client({
        webSocketFactory: () => socket,
        debug: (str) => {
          console.log('STOMP Debug (채팅방 목록):', str)
        },
        reconnectDelay: 0,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000
      })
      
      // 연결 성공
      client.onConnect = (frame) => {
        console.log('✅ STOMP 연결 성공 (채팅방 목록)!')
        console.log('연결된 서버:', serverUrl)
        
        // 연결 상태 업데이트
        set({ isConnected: true, stompClient: client })
        
        // 토큰에서 사용자 ID 추출
        const token = localStorage.getItem('accessToken')
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]))
            const myUserId = payload.sub
            
            console.log(`📡 채팅방 목록 구독 시작 (사용자: ${myUserId})`)
            
            // 채팅방 목록 구독
            client.subscribe(`/sub/chat/roomlist/${myUserId}`, (messageOutput) => {
              const roomList = JSON.parse(messageOutput.body)
              console.log('📥 채팅방 목록 수신:', roomList)
              
              // 받은 데이터를 RoomList 형식으로 변환
              const formattedRoomList = roomList.map((room: any) => ({
                roomId: room.roomId,
                unreadMessagesNum: room.unreadMessagesNum || 0,
                lastMessageContent: room.lastChatmessageDto?.content || '',
                lastMessageTime: room.lastChatmessageDto?.createdAt || '',
                type: room.lastChatmessageDto?.type || 'TEXT',
                seller: {
                  id: room.sellerId,
                  nickname: room.sellerNickname || '판매자'
                },
                product: {
                  id: room.productId,
                  thumnail: room.productThumbnail || ''
                }
              }))
              
              set({ roomList: formattedRoomList })
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

  disconnectStomp: () => {
    const { stompClient } = get()
    if (stompClient) {
      stompClient.deactivate()
      set({ stompClient: null, isConnected: false })
    }
  },

  setRoomList: async () => {
    // STOMP 연결이 되어 있지 않으면 연결
    const { isConnected } = get()
    if (!isConnected) {
      get().connectStomp()
    }
  },

  setRoomDetail: async (roomId: number) => {
    // STOMP 연결이 되어 있지 않으면 연결
    const { isConnected } = get()
    if (!isConnected) {
      get().connectStomp()
    }
  }
}))

export default useRoomListStore