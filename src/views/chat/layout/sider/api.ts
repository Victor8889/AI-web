/*
  * @Description:
 */
import { request } from '@/utils'
export default {
  // 获取消息列表数据
  getRoomPage: (params: Chat.RoomListResponse) => request.get('/room/page', { params }),
  updateRoom: (data: Chat.editRoomVo) => request.post('/room/edit', {
    color: '#fead0b',
    name: data.name,
    roomId: data.roomId,
  }),
  deleteRoom: (roomId: number) => request.delete(`/room/delete?roomId=${roomId}`),

  addRoom: (data: Chat.addRoomVo) => request.post('/room/create', data),
  getCellList: () => request.get('/cell/list'),
  getCellImgList: () => request.get('/cell/list_image'),
  getCellConfigList: (cellCode: string) => request.get(`/cell_config/list?cellCode=${cellCode}`),
}
