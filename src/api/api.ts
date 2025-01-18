/*
 *
 * @Description: 接口
 */
import { request } from '@/utils'

export default {
  // 获取房间消息详情
  getUserInfo: () => request.get('/user/user_info'),
  // 获取房间消息详情
  password: (oldpass: string, newpass: string) => request.post(`/user/setting/password?oldpass=${oldpass}&newpass=${newpass}`),
  // RoomMidjourneyDescribe: (data: DescribeRequest) => upload(data),
  RoomMidjourneyDescribe: (data: any) => request.post('/room/midjourney/describe', data),
  pageRecords: (params: Chat.getPage) => request.get('/user/page_records', { params }),
  getRecharges: (params: Chat.getPage) => request.get('/user/page_recharge', { params }),
  getInvites: (params: Chat.getPage) => request.get('/user/page_invite', { params }),
  getWXCodeUrl: (amount: number, points: number) => request.get(`/pay/code_url?amount=${amount}&points=${points}`),
  getZFBCodeUrl: (amount: number, points: number) => request.get(`/pay/zfb/code_url?amount=${amount}&points=${points}`),
  getZFBMobileCodeUrl: (amount: number, points: number) => request.get(`/pay/zfb/mobile_url?amount=${amount}&points=${points}`),

  getZFBVipCodeUrl: (amount: number, points: number) => request.get(`/pay/zfb/vip_code_url?amount=${amount}&points=${points}`),
  getZFBVipMobileCodeUrl: (amount: number, points: number) => request.get(`/pay/zfb/vip_mobile_url?amount=${amount}&points=${points}`),

  getAiStatus: (orderId: string, id: number, type: number, points: number) => request.get(`/pay/zfb_status?orderId=${orderId}&id=${id}&type=${type}&points=${points}`),

  shops: () => request.get('/user/shops'),
  products: () => request.get('/user/products'),
  vipPrice: () => request.get('/user/vip_price'),
  logouts: () => request.get('/user/logout'),
  notice: () => request.get('/user/notice'),
}
