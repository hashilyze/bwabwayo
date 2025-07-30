import { create } from 'zustand'

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
  setRoomList: () => Promise<void>
  setRoomDetail: (roomId: number) => Promise<void>
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

export const useRoomListStore = create<RoomListStore>((set) => ({
  roomList: [],

  setRoomList: async () => {
    // const response = await fetch(`https://i13e202.p.ssafy.io/api/chatrooms`)
    // const data = await response.json()
    set({ roomList: DUMMY_DATA })
  },

  setRoomDetail: async (roomId: number) => {
    // const response = await fetch(`https://i13e202.p.ssafy.io/api/chatrooms/${roomId}`)
    // const data = await response.json()
    set({ roomList: DUMMY_DATA })
  }
}))

export default useRoomListStore