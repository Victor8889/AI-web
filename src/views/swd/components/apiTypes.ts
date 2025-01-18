import { defineStore } from 'pinia'
import { toRaw } from 'vue'
import { getLocal, isEmpty, setLocal } from '@/utils'
/**
 * swd 房间列表请求数据参数
 */
export interface sendRequest {
  /**
   * 消息内容
   */
  roomId: number | string
  /**
   * 房间 id
   */
  text: string
}
const ROOMS_SWD_CODE = 'swd'
export interface SwdVO {

  /**
   * 图片地址
   */
  aiInput?: String
  /**
   * discord 开始时间
   * 0等待，1进行中，2完成，3出错
   */
  isCompleted?: number | string

}

export const useSwdStore = defineStore('swd', {
  state() {
    return {
      // 存在本地的消息
      swdData: <SwdVO> {
        // 设置一个默认值
        aiInput: '',
        isCompleted: 0,
      },
    }
  },
  getters: {
    swdDatas(): SwdVO {
      const locaData: SwdVO | null = toRaw(getLocal(ROOMS_SWD_CODE))
      if (locaData !== null && !isEmpty(locaData))
        this.swdData = locaData

      return this.swdData || null
    },
  },
  actions: {
    addlocaSwdVO(mList: SwdVO): void {
      this.swdData = mList
      setLocal(ROOMS_SWD_CODE, mList)
    },

  },

})
