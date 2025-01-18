/*
 * @Author: lk
 * @LastEditTime: 2023-07-04 22:02:29
 * @FilePath: \ai-beehive-web\src\views\cellRoom\openaiChat\api.ts
 * @Description: 登录注册逻辑
 */
import { request } from '@/utils'
let controller = new AbortController()
function handleStop() {
  controller.abort()
  controller = new AbortController()
}
async function loadData(postData: Chat.sendRequest, returnData: Function) {
  try {
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
  // 获取参数详情
  getUserPram: () => request.get('/user/setting/get_user_param'),
  // 更新参数详情
  getRoomPage: (params: Chat.RoomListResponse) => request.get('/room/page', { params }),

  updateUserPram: (UserParam: Chat.UserParam) => request.post('/user/setting/user_param', UserParam),
  handleStop: () => handleStop(),

  // 获取参数详情
  getModelSelect: () => request.get('/user/show_model'),
}
