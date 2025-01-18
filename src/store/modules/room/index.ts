/*
 * @Description:
 */
import { defineStore } from 'pinia'
import { toRaw } from 'vue'
import { getLocal, isEmpty, setLocal } from '@/utils'
interface RoomInfo {
  /**
   * cell code
   */
  cellCode?: string
  /**
   * 颜色，十六进制
   */
  color?: string
  /**
   * 创建时间
   */
  createTime?: string
  /**
   * 房间 id
   */
  roomId?: number
  /**
   * 是否固定 false 否 true 是
   */
  isPinned?: boolean
  /**
   * 名称
   */
  name?: string
  // 是否是编辑状态
  isEdit?: boolean
}
interface RoomOpenAiChatMsgVO {
  /**
   * 消息内容
   */
  content?: string
  /**
   * 创建时间
   */
  createTime?: Date
  /**
   * 主键
   */
  id?: number
  /**
   * 消息类型
   */
  messageType?: MessageType
}
enum MessageType {
  Answer = 'answer',
  Question = 'question',
}
const ROOMS_MESSAGE_CODE = 'rooms_message'
/**
* Cell 封面展示对象
*/
interface CellImageVO {
  /**
   * 编码
   */
  code?: string
  /**
   * 封面
   */
  imageUrl?: string
}

//  去重
const unique = (arr: any, key: string) => {
  const result = {}
  for (const item of arr)
    result[item[key]] = item

  return Object.values(result) // 再转化为数组
}

// 筛选
function contains(arr: Array<{ roomId: number; messageList: RoomOpenAiChatMsgVO[] }>, val: number) {
  let selectItem: RoomOpenAiChatMsgVO[] = []
  for (const item of arr) {
    if (item.roomId === val) {
      selectItem = item.messageList
      break
    }
  }
  return selectItem
}

export const useRoomStore = defineStore('room', {
  state() {
    return {
      roomInfo: <RoomInfo> {},
      cellImgList: <CellImageVO[]> [],
      // 存在本地的消息
      messageList: <RoomOpenAiChatMsgVO[]> [],
    }
  },
  getters: {
    roomData(): RoomInfo {
      return this.roomInfo || {}
    },
    messageListData(): RoomOpenAiChatMsgVO[] {
      return this.messageList || []
    },
  },
  actions: {
    resetRoomInfo() {
      this.roomInfo = {}
    },
    setRoomInfo(roomInfo: RoomInfo = {}) {
      this.roomInfo = { ...this.roomInfo, ...roomInfo }
      this.getlocaMessageItem()
    },
    setCellImgList(imgList: CellImageVO[]) {
      this.cellImgList = imgList
    },

    setlocaMessageList(mList: RoomOpenAiChatMsgVO[]) {
      // const locaData = getLocal(ROOMS_MESSAGE_CODE)
      const locaData: Array<{ roomId: number; messageList: RoomOpenAiChatMsgVO[] }> | null = toRaw(getLocal(ROOMS_MESSAGE_CODE))
      this.messageList = mList
      const roomData = {
        roomId: this.roomInfo.roomId,
        messageList: mList,
      }

      if (locaData !== null && !isEmpty(locaData))
        setLocal(ROOMS_MESSAGE_CODE, unique([...locaData, roomData], 'roomId'))

      else
        setLocal(ROOMS_MESSAGE_CODE, [roomData])
    },
    getlocaMessageItem() {
      const locaData: Array<{ roomId: number; messageList: RoomOpenAiChatMsgVO[] }> | null = toRaw(getLocal(ROOMS_MESSAGE_CODE))

      if (locaData !== null && !isEmpty(locaData) && this.roomInfo.roomId)
        this.messageList = contains(locaData, this.roomInfo.roomId)
    },
    getImgUrl(cellType: string) {
      if (this.cellImgList.length > 0) {
        for (const item of this.cellImgList) {
          if (cellType === item.code)
            return item.imageUrl ?? ''
        }
      }
      else {
        for (const item of getLocal('cellImgList') as CellImageVO[]) {
          if (cellType === item.code)
            return item.imageUrl ?? ''
        }
      }

      return ''
    },
  },
})
