/*
 *
 * @Description: mj接口
 */
import { useMessage } from 'naive-ui'
import type { ActionRequest, ImagineRequest, PageMidjourneyRequest, UpscaleRequest, VariationRequest, modalImagineRequest, sendRequest } from './types/apiTypes'
import { request } from '@/utils'
import { getToken } from '@/utils/auth/token'

let controller = new AbortController()
function handleStop() {
  controller.abort()
  controller = new AbortController()
}
async function loadData(postData: sendRequest, returnData: Function) {
  try {
    const token = getToken()
    if (!token) {
      window.location.href = '#/login'
      const ms = useMessage()
      ms.error('登录已过期，请先登录！')
      return null// Promise.reject(new AxiosRejectError({ code: 401, message: '登录已过期，请重新登录！' }))
    }
    const response = await fetch('/api/room/openai_chat/send', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      body: JSON.stringify(postData),
      signal: controller.signal,
    })
    // 异常情况返回异常状态
    if (response.status !== 200) {
      const reader = (response as any).body.getReader()
      const { value } = await reader.read()
      const errData = JSON.parse(new TextDecoder().decode(value))
      return errData
    }

    const reader = (response as any).body.getReader()
    let data = ''
    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        returnData(data, done)
        break
      }

      const newText = new TextDecoder().decode(value)

      data += newText
      returnData(data)
    }
  }
  catch {
    console.error('请求失败')
  }
}

export default {
  // 获取房间消息详情
  getRoomDetail: (roomId: number | string) => request.get(`/room/detail?roomId=${roomId}`),
  // 获取消息列表
  getRoomMidjourneyList: (mjType: number) => request.get(`/room/midjourney/list?mjType=${mjType}`),
  getRoomMidjourneyPage: (params: PageMidjourneyRequest) => request.get('/room/midjourney/page', { params }),
  getRoomMidjourneyItem: (msgId: string) => request.get(`/room/midjourney/detail?msgId=${msgId}`),
  delMidjourneyItem: (id: string) => request.get(`/room/midjourney/delete/${id}`),
  RoomMidjourneyImagine: (data: ImagineRequest) => request.post('/room/midjourney/imagine', data),
  AddMidjourneyImagine: (data: ImagineRequest) => request.post('/room/midjourney/image', data),

  // RoomMidjourneyDescribe: (data: DescribeRequest) => upload(data),
  RoomMidjourneyDescribe: (data: any) => request.post('/room/midjourney/describe', data),
  RoomMidjourneyUpscale: (data: UpscaleRequest) => request.post('/room/midjourney/upscale', data),
  RoomMidjourneyVariation: (data: VariationRequest) => request.post('/room/midjourney/variation', data),
  RoomMidjourneyModal: (data: modalImagineRequest) => request.post('/room/midjourney/modalImg', data), // 局部重绘

  // 新增
  RoomMidjourneyCzp: (data: ActionRequest) => request.post('/room/midjourney/cpzaction', data),

  RoomOpenaiChatSend: (data: sendRequest, returnData: Function) => loadData(data, returnData),
  uploadImg: (data: any, type: string) => request.post('/room/midjourney/upload', data, type),
}
export const mlog = (msg: string, ...args: unknown[]) => {
  // localStorage.setItem('debug',1 )
  const logStyles = [
  // 'padding: 4px 8px',
  // 'color: #fff',
  // 'border-radius: 3px',
    'color:',
  ].join(';')
  const debug = localStorage.getItem('debug')
  if (!debug)
    return
  const style = `${logStyles}${msg.includes('error') ? 'red' : '#dd9089'}`
  console.log('%c[mjgpt]', style, msg, ...args)
}
