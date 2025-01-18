/*
  * @Description: 聊天接口
 */
import { request } from '@/utils'
let controller = new AbortController()
function handleStop() {
  controller.abort()
  controller = new AbortController()
}

export default {
  // 获取房间消息详情
  getRoomDetail: (roomId: number | string) => request.get(`/room/detail?roomId=${roomId}`),
  // 获取消息列表
  getRoomOpenaiChatList: (params: Chat.RoomOpenaiChatListRequest) => request.get('/room/openai_chat/list', { params }),
  deleteRoom: (roomId: number) => request.delete(`/room/delete?roomId=${roomId}`),
  deleteChat: (id: number) => request.delete(`/room/openai_chat/delete?id=${id}`),

  updateRoom: (data: Chat.editRoomVo) => request.post('/room/edit', {
    color: '#fead0b',
    name: data.name,
    roomId: data.roomId,
  }),
  addRoom: (data: Chat.addRoomVo) => request.post('/room/add', data),
  handleStop: () => handleStop(),
  uploadImg: (data: any, type: any) => request.post('/room/midjourney/upload', data),
}
