import { defineStore } from 'pinia'
import { toRaw } from 'vue'
import { getLocal, isEmpty, setLocal } from '@/utils'
/**
 * qr 房间列表请求数据参数
 */
export interface RoomQrRequest {
  cursor: string
  isAsc: boolean
  isUseCursor: boolean
  // roomId?: number | string
  size: number
}
/**
 * qr 创建图像参数
 */
export interface RoomQrVORequest {
  /**
   * 消息内容
   */
  model?: string // 模型
  userUrl?: string // 用户URL
  description?: string // 描述
  artNumber?: string // 艺术编号
  style?: string // 风格
  version?: string // 版本
  prompt?: string // 提示
  barcode?: string // 码眼
  proportion?: string // 比例
  qrFormat?: string // 二维码格式

}
/**
 * qr 描述请求
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
}
/**
 * qr variation 转换请求参数
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
}
/**
 * qr 房间列表请求响应结果
 */
export interface Response {
  /**
   * 状态码
   */
  code?: number
  /**
   * 承载数据
   */
  data?: RoomQrVO[]
  /**
   * 返回消息
   */
  message?: string
}

/**
* qr 房间消息
*/
export interface RoomQrVO {
  /**
     * id
     */
  id?: number
  /**
   * 创建时间
   */
  createTime?: Date
  /**
   * 内容
   */
  description?: String
  /**
   * 图片地址
   */
  qrUrl?: String
  /**
   * discord 开始时间
   * 0等待，1进行中，2完成，3出错
   */
  isCompleted?: number | string

}

export enum Status {
  'wait' = '等待',
  'run' = '进行中',
  'completed' = '完成',
  'error' = '失败',
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
const ROOMS_QR_CODE = 'qr_list'
//  去重
const unique = (arr: any) => {
  const result = {}
  // for (const item of arr)
  //   result[item] = item

  return Object.values(result) // 再转化为数组
}

// 筛选
function contains(arr: Array<{ roomId: number; messageList: RoomQrVO[] }>) {
  let selectItem: RoomQrVO[] = []
  for (const item of arr) {
    if (item.roomId === 0) {
      selectItem = item.messageList
      break
    }
  }
  return selectItem
}

export const useQrStore = defineStore('qr', {
  state() {
    return {
      // 存在本地的消息
      qrList: <RoomQrVO[]> [],
    }
  },
  getters: {
    qrListData(): RoomQrVO[] {
      const locaData: RoomQrVO[] | null = toRaw(getLocal(ROOMS_QR_CODE))
      if (locaData !== null && !isEmpty(locaData))
        this.qrList = locaData

      return this.qrList || []
    },
  },
  actions: {
    setlocaQrList(mList: RoomQrVO[]) {
      // const locaData = getLocal(ROOMS_MESSAGE_CODE)
      const locaData: RoomQrVO[] | null = toRaw(getLocal(ROOMS_QR_CODE))
      this.qrList = mList
      const qrData = {
        qrList: mList,
      }

      if (locaData !== null && !isEmpty(locaData))
        setLocal(ROOMS_QR_CODE, [...locaData, qrData])

      else
        setLocal(ROOMS_QR_CODE, [qrData])
    },
    addlocaQrList(mList: RoomQrVO[], isadd: boolean): void {
      const locaData: RoomQrVO[] | null = toRaw(getLocal(ROOMS_QR_CODE))
      // this.qrList = mList
      // const qrData = {
      //   qrList: mList,
      // }
      if (!isadd) {
        this.qrList = [...mList]
        setLocal(ROOMS_QR_CODE, [...mList])
      }
      else {
        if (locaData !== null && !isEmpty(locaData)) {
          this.qrList.unshift(...mList)
          setLocal(ROOMS_QR_CODE, this.qrList)
        }
        else {
          this.qrList = [...mList]
          setLocal(ROOMS_QR_CODE, [...mList])
        }
      }
    },
    getlocaQrItem() {
      const locaData: Array<{ messageList: RoomQrVO[] }> | null = toRaw(getLocal(ROOMS_QR_CODE))

      if (locaData !== null && !isEmpty(locaData))
        this.qrList = contains(locaData)
    },
    clearQr() {
      this.qrList = []
      setLocal(ROOMS_QR_CODE, [])
    },
  },
})
