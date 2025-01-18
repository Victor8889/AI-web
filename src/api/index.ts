/*
 * @Author: lk
 * @LastEditTime: 2023-04-16 17:44:19
 * @FilePath: \chagpt\src\api\index.ts
 * @Description:
 */
import type { AxiosProgressEvent, GenericAbortSignal } from 'axios'
import { get, post } from '@/utils/request'
// export { request } from '@/utils/http'

export function fetchChatAPI<T = any>(
  prompt: string,
  options?: { conversationId?: string; parentMessageId?: string },
  signal?: GenericAbortSignal,
) {
  return post<T>({
    url: '/chat',
    data: { prompt, options },
    signal,
  })
}

export function fetchChatAPIProcess<T = any>(
  params: {
    text: string
    roomId: string
    options?: { conversationId?: string; parentMessageId?: string }
    signal?: GenericAbortSignal
    onDownloadProgress?: (progressEvent: AxiosProgressEvent) => void },
) {
  const data: Record<string, any> = {
    text: params.text,
    roomId: params.roomId,
    options: params.options,
  }

  return post<T>({
    url: '/room/openai_chat/send', // '/chat_message/send',
    data,
    signal: params.signal,
    onDownloadProgress: params.onDownloadProgress,
  })
}

// 获取房间列表
export function fetchRoomAPIProcess<T = any>(
  params: {
    pageNum: number
    pageSize: number
    name: string
  },
) {
  const data: Record<string, any> = {
    pageNum: params.pageNum,
    pageSize: params.pageSize,
    name: params.name,
  }

  return get<T>({
    url: '/room/page',
    data,
    // signal: params.signal,
    // onDownloadProgress: params.onDownloadProgress,
  })
}
export default {
  // getUser: () => request.get('/user/info'),
  // refreshToken: () => request.post('/auth/refreshToken'),
}
