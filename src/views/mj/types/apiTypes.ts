/**
 * Midjourney 房间列表请求数据参数
 */

import { defineStore } from 'pinia'
import { reactive, toRaw } from 'vue'
import { getLocal, isEmpty, setLocal } from '@/utils'
export interface RoomMidjourneyRequest {
  cursor: string
  isAsc: boolean
  isUseCursor: boolean
  roomId: number | string
  size: number
}
export interface PageMidjourneyRequest {
  pageSize: number
  pageNum: number
  roomId: number | string
  mjType: number | string
}
/**
* 承载数据
*/
interface IPageRoomListVO {
  current?: number
  pages?: number
  records?: RoomMidjourneyMsgVO[]
  size?: number
  total?: number
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
 * Midjourney 创建图像参数
 */
export interface ImagineRequest {
  /**
   * 提示语
   */
  prompt: string
  /**
   * 房间 id
   */
  roomId: number | string
  baseImg: string
  params: string
  mjType: number | string
}
export interface modalImagineRequest {
  /**
   * 提示语
   */
  prompt: string
  /**
   * 房间 id
   */
  roomId: number | string
  mjType: number | string
  maskBase64: string
  msgId: number | string
  action: string
  actionName: string
}
/**
 * Midjourney 描述请求
 */
export interface DescribeRequest {
  file: any
  /**
   * 房间 id
   */
  roomId: number | string
}
/**
 * Midjourney upscale 转换请求参数
 */
export interface UpscaleRequest {
  /**
   * 下标
   */
  index: number
  /**
   * 消息 id
   */
  msgId: number
  /**
   * 房间 id
   */
  roomId: number | string
  mjType: number | string// 速度
}
export interface ActionRequest {

  /**
   * 消息 id
   */
  msgId: number
  /**
   * 房间 id
   */
  roomId: number | string
  mjType: number | string// 速度

  action: string
  actionName: string
}
/**
 * Midjourney variation 转换请求参数
 */
export interface VariationRequest {
  /**
   * 下标
   */
  index: number
  /**
   * 消息 id
   */
  msgId: number
  /**
   * 房间 id
   */
  roomId: number | string
  mjType: number | string// 速度
}
/**
 * Midjourney 房间列表请求响应结果
 */
export interface Response {
  /**
   * 状态码
   */
  code?: number
  /**
   * 承载数据
   */
  data?: RoomMidjourneyMsgVO[]
  /**
   * 返回消息
   */
  message?: string
}
export interface sendRequest {
  /**
   * 消息内容
   */
  content: string
  /**
   * 房间 id
   */
  roomId: number | string
}
/**
* Midjourney 房间消息
*/
export interface RoomMidjourneyMsgVO {
  /**
     * 指令动作枚举
     */
  action?: Action
  /**
   * 压缩图片地址
   */
  compressedImageUrl?: string
  /**
   * 创建时间
   */
  createTime?: Date
  /**
   * discord 结束时间
   */
  discordFinishTime?: Date
  /**
   * discord 图片地址
   */
  discordImageUrl?: string
  /**
   * discord 开始时间
   */
  discordStartTime?: Date
  /**
   * 最终的输入
   */
  finalPrompt?: string
  /**
   * 消息 id
   */
  id?: number
  /**
   * 原始图片地址
   */
  originalImageUrl?: string
  /**
   * 用户输入
   */
  prompt?: string
  /**
   * 响应内容
   */
  responseContent?: string
  /**
   * 房间 id
   */
  roomId?: number
  /**
   * 状态枚举
   */
  status?: Status
  /**
   * 消息类型
   */
  type?: Type
  uuseBit?: number
  /**
   * uv 位置
   */
  uvIndex?: number
  /**
   * 排队中的队列长度
   */
  waitQueueLength?: number
  /**
   * 进度
   */
  progressing?: number
  /**
   * 失败原因
   */
  failureReason?: string
}

export enum Action {
  Describe = 'DESCRIBE',
  Imagine = 'IMAGINE',
  Upscale = 'UPSCALE',
  Variation = 'VARIATION',
}

export enum Status {
  MJFailure = 'MJ_FAILURE', // MJ 失败
  MjInProgress = 'MJ_IN_PROGRESS', // MJ 执行中
  MjSuccess = 'MJ_SUCCESS', // MJ 成功
  MjWaitReceived = 'MJ_WAIT_RECEIVED', // 等待 MJ 接受消息
  SysFailure = 'SYS_FAILURE', // 系统发送 MJ 请求失败
  SysFinishMjInProgressFailure = 'SYS_FINISH_MJ_IN_PROGRESS_FAILURE', // 系统完成 MJ 执行中任务失败
  SysMaxQueue = 'SYS_MAX_QUEUE', // 系统排队上限
  SysQueuing = 'SYS_QUEUING', // 系统排队中
  SysSendMjRequestFailure = 'SYS_SEND_MJ_REQUEST_FAILURE', // 系统等待 MJ 接收消息失败
  SysSuccess = 'SYS_SUCCESS', // 系统成功
  SysWaitMjReceivedFailure = 'SYS_WAIT_MJ_RECEIVED_FAILURE', // 系统发送 MJ 请求失败
}

export enum Type {
  Answer = 'answer',
  Question = 'question',
}

/**
 * 通用响应结果
 */
export interface genlResponse {
  /**
   * 状态码
   */
  code?: number
  /**
   * 承载数据
   */
  data?: boolean
  /**
   * 返回消息
   */
  message?: string
}

const ROOMS_MJ_CODE = 'mj_list'
export const useMjStore = defineStore('mj', {
  state() {
    return {
      // 存在本地的消息
      mjList: <RoomMidjourneyMsgVO[]> [],
    }
  },
  getters: {
    mjListData(): RoomMidjourneyMsgVO[] {
      const locaData: RoomMidjourneyMsgVO[] | null = toRaw(getLocal(ROOMS_MJ_CODE))
      if (locaData !== null && !isEmpty(locaData))
        this.mjList = locaData

      return this.mjList || []
    },
  },
  actions: {
    setlocaMjList(mList: RoomMidjourneyMsgVO[]) {
      // const locaData = getLocal(ROOMS_MESSAGE_CODE)
      const locaData: RoomMidjourneyMsgVO[] | null = toRaw(getLocal(ROOMS_MJ_CODE))
      this.mjList = mList
      const qrData = {
        mjList: mList,
      }

      if (locaData !== null && !isEmpty(locaData))
        setLocal(ROOMS_MJ_CODE, [...locaData, qrData])

      else
        setLocal(ROOMS_MJ_CODE, [qrData])
    },
    addlocalMjList(mList: RoomMidjourneyMsgVO[], isadd: boolean): void {
      const locaData: RoomMidjourneyMsgVO[] | null = toRaw(getLocal(ROOMS_MJ_CODE))

      if (!isadd) {
        this.mjList = [...mList.slice().reverse()]
        setLocal(ROOMS_MJ_CODE, [...mList.slice().reverse()])
      }
      else {
        if (locaData !== null && !isEmpty(locaData)) {
          this.mjList.unshift(...mList.slice().reverse())
          setLocal(ROOMS_MJ_CODE, this.mjList.slice().reverse())
        }
        else {
          this.mjList = [...mList.slice().reverse()]
          setLocal(ROOMS_MJ_CODE, [...mList.slice().reverse()])
        }
      }
    },
    getlocaOpenImgItem() {
      const locaData: Array<{ messageList: RoomMidjourneyMsgVO[] }> | null = toRaw(getLocal(ROOMS_MJ_CODE))

      if (locaData !== null && !isEmpty(locaData))
        this.mjList = contains(locaData)
    },
    removeMj() {

    },
  },
})

const RUN_MJ_CODE = 'run_mj_list'
export const runMjStore = defineStore('run_mj', {
  state() {
    return {
      // 存在本地的消息
      mjList: <RoomMidjourneyMsgVO[]> [],
    }
  },
  getters: {
    mjListData(): RoomMidjourneyMsgVO[] {
      const locaData: RoomMidjourneyMsgVO[] | null = toRaw(getLocal(RUN_MJ_CODE))
      if (locaData !== null && !isEmpty(locaData))
        this.mjList = locaData

      return this.mjList || []
    },
  },
  actions: {
    setlocaMjList(mList: RoomMidjourneyMsgVO[]) {
      // const locaData = getLocal(ROOMS_MESSAGE_CODE)
      const locaData: RoomMidjourneyMsgVO[] | null = toRaw(getLocal(RUN_MJ_CODE))
      this.mjList = mList
      const qrData = {
        mjList: mList,
      }

      if (locaData !== null && !isEmpty(locaData))
        setLocal(RUN_MJ_CODE, [...locaData, qrData])

      else
        setLocal(RUN_MJ_CODE, [qrData])
    },
    addMj(mj: RoomMidjourneyMsgVO) {
      const locaData: RoomMidjourneyMsgVO[] | null = toRaw(getLocal(RUN_MJ_CODE))
      if (locaData !== null && !isEmpty(locaData)) {
        this.mjList.push(mj)
        setLocal(RUN_MJ_CODE, this.mjList.slice().reverse())
      }
      else {
        this.mjList[0] = mj
        setLocal(RUN_MJ_CODE, mj)
      }
    },
    addlocalMjList(mList: RoomMidjourneyMsgVO[], isadd: boolean): void {
      const locaData: RoomMidjourneyMsgVO[] | null = toRaw(getLocal(RUN_MJ_CODE))

      if (!isadd) {
        this.mjList = [...mList.slice().reverse()]
        setLocal(RUN_MJ_CODE, [...mList.slice().reverse()])
      }
      else {
        if (locaData !== null && !isEmpty(locaData)) {
          this.mjList.unshift(...mList.slice().reverse())
          setLocal(RUN_MJ_CODE, this.mjList.slice().reverse())
        }
        else {
          this.mjList = [...mList.slice().reverse()]
          setLocal(RUN_MJ_CODE, [...mList.slice().reverse()])
        }
      }
    },
    getlocaOpenImgItem() {
      const locaData: Array<{ messageList: RoomMidjourneyMsgVO[] }> | null = toRaw(getLocal(RUN_MJ_CODE))

      if (locaData !== null && !isEmpty(locaData))
        this.mjList = contains(locaData)
    },
  },
})

export const homeStore = reactive({
  myData: {
    act: '', // 动作
    actData: {}, // 动作类别
    local: '', // 当前所处的版本
    session: {} as any,
    isLoader: false,

  },

  setMyData(v: object) {
    this.myData = { ...this.myData, ...v }
    if (Object.keys(v).includes('act')) {
      setTimeout(() => {
        this.myData.act = ''
        this.myData.actData = ''
      }, 2000)
    }
  },

})
