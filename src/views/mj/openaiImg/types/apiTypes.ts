/*
 * @Author: LK
 * @LastEditTime: 2023-07-04 22:07:10
 * @FilePath: \ai-beehive-web\src\views\cellRoom\openaiImg\types\apiTypes.ts
 * @Description:
 */
import { defineStore } from 'pinia'
import { toRaw } from 'vue'
import { getLocal, isEmpty, setLocal } from '@/utils'
export interface RoomOpenAiImageListRequest {
  cursor: string
  isAsc: boolean
  isUseCursor: boolean
  roomId: undefined | number | string
  size: number
}

/**
 * 响应结果
 */
export interface RoomOpenAiImageListResponse {
  /**
   * 状态码
   */
  code?: number
  /**
   * 承载数据
   */
  data?: RoomOpenAiImageMsgVO[]
  /**
   * 返回消息
   */
  message?: string
}

/**
* OpenAi 图像房间消息展示参数
*/
export interface RoomOpenAiImageMsgVO {
  /**
   * 创建时间
   */
  createTime?: Date
  /**
   * 主键
   */
  id?: number
  /**
   * 图像 url
   */
  imageUrl?: string
  /**
   * 消息类型
   */
  messageType?: MessageType
  /**
   * OpenAi 图像 url
   */
  openaiImageUrl?: string
  /**
   * 输入内容
   */
  prompt?: string
  /**
   * 尺寸大小
   */
  size?: string
  /**
   *  模型
   */
  model?: string
  /**
   * 消息状态
   */
  status?: Status
}

/**
* 消息类型
*/
export enum MessageType {
  Answer = 'answer',
  Question = 'question',
}

export interface sendRequest {
  /**
   * 消息内容
   */
  prompt: string
  /**
   * 房间 id
   */
  roomId: number | string
  runParams?: string
}
/**
 * 消息状态
 */
export enum Status {
  Failure = 'FAILURE',
  Init = 'INIT',
  Success = 'SUCCESS',
}
const ROOMS_OPENIMG_CODE = 'openImg_list'
export const useOpenImgStore = defineStore('openImg', {
  state() {
    return {
      // 存在本地的消息
      openImgList: <RoomOpenAiImageMsgVO[]> [],
    }
  },
  getters: {
    openImgListData(): RoomOpenAiImageMsgVO[] {
      const locaData: RoomOpenAiImageMsgVO[] | null = toRaw(getLocal(ROOMS_OPENIMG_CODE))
      if (locaData !== null && !isEmpty(locaData))
        this.openImgList = locaData

      return this.openImgList || []
    },
  },
  actions: {
    setlocaOpenImgList(mList: RoomOpenAiImageMsgVO[]) {
      // const locaData = getLocal(ROOMS_MESSAGE_CODE)
      const locaData: RoomOpenAiImageMsgVO[] | null = toRaw(getLocal(ROOMS_OPENIMG_CODE))
      this.openImgList = mList
      const qrData = {
        openImgList: mList,
      }

      if (locaData !== null && !isEmpty(locaData))
        setLocal(ROOMS_OPENIMG_CODE, [...locaData, qrData])

      else
        setLocal(ROOMS_OPENIMG_CODE, [qrData])
    },
    addlocalOpenImgList(mList: RoomOpenAiImageMsgVO[], isadd: boolean): void {
      const locaData: RoomOpenAiImageMsgVO[] | null = toRaw(getLocal(ROOMS_OPENIMG_CODE))

      if (!isadd) {
        this.openImgList = [...mList.slice().reverse()]
        setLocal(ROOMS_OPENIMG_CODE, [...mList.slice().reverse()])
      }
      else {
        if (locaData !== null && !isEmpty(locaData)) {
          this.openImgList.unshift(...mList.slice().reverse())
          setLocal(ROOMS_OPENIMG_CODE, this.openImgList.slice().reverse())
        }
        else {
          this.openImgList = [...mList.slice().reverse()]
          setLocal(ROOMS_OPENIMG_CODE, [...mList.slice().reverse()])
        }
      }
    },
    getlocaOpenImgItem() {
      const locaData: Array<{ messageList: RoomOpenAiImageMsgVO[] }> | null = toRaw(getLocal(ROOMS_OPENIMG_CODE))

      if (locaData !== null && !isEmpty(locaData))
        this.openImgList = contains(locaData)
    },
  },
})
