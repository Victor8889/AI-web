/*
 *
 * @Description: mj接口
 */
import { useMessage } from 'naive-ui'
import type { sendRequest } from './components/apiTypes'
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
      // route.push('/login')
      ms.error('登录已过期，请！')
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
  RoomOpenaiChatSend: (data: sendRequest, returnData: Function) => loadData(data, returnData),
}
