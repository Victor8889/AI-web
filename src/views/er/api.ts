/*
 *
 * @Description: mj接口
 */
import type { RoomQrRequest, RoomQrVORequest } from './components/apiTypes'
import { request } from '@/utils'

export default {
  // 获取房间消息详情
  getRoomDetail: (roomId: number | string) => request.get(`/room/detail?roomId=${roomId}`),
  // 获取消息列表
  getRoomQrList: (params: RoomQrRequest) => request.get('/room/qr/list', { params }),
  addQr: (data: RoomQrVORequest) => request.post('/room/qr/add', data),
  // RoomMidjourneyDescribe: (data: DescribeRequest) => upload(data),
  RoomMidjourneyDescribe: (data: any) => request.post('/room/midjourney/describe', data),
}
