import { ss } from '@/utils/storage'

const LOCAL_NAME = 'chatStorage'
const LOCAL_NAME1 = 'userParamStor'

export function defaultState(): Chat.ChatState {
  const roomId = -999999
  return {
    active: roomId,
    usingContext: true,
    history: [{ roomId, title: 'New Chat1', name: 'New Chat', isEdit: false, createTime: '2023-07' }],
    chat: [{ roomId, data: [] }],
  }
}

export function getLocalState(): Chat.ChatState {
  const localState = ss.get(LOCAL_NAME)

  return { ...defaultState(), ...localState }
}

export function setLocalState(state: Chat.ChatState) {
  ss.set(LOCAL_NAME, state)
}

/** 新版 */
export function defaultParState(): Chat.userParamState {
  return {
    username: 'Guest', // 默认用户名为 "Guest"
    roomId: 0, // 默认uuid为 0
    total: 0,
    nightMode: false,
    isMj: true,
    userParam: {
      id: '', // 默认id为空字符串
      apikey: '', // 默认apikey为空字符串
      temperature: 0.7, // 默认temperature为0.7
      contextCount: 2, // 默认contextCount为2
      presencePenalty: 0.6, // 默认presencePenalty为0.6
      chatModel: '3.5', // 默认chatModel为"gpt3"
    },
  }
}
export function getParLocalState(): Chat.userParamState {
  const localState = ss.get(LOCAL_NAME1)
  return { ...defaultParState(), ...localState }
}
export function setParLocalState(state: Chat.userParamState) {
  ss.set(LOCAL_NAME1, state)
}

export function getLocalStateChat(): Chat.OpenAiChatState {
  const localState = ss.get(LOCAL_NAME)
  return { ...defaultState(), ...localState }
}

export function setLocalStateChat(state: Chat.OpenAiChatState) {
  ss.set(LOCAL_NAME, state)
}
export function setLocalUuid(localName: string, roomId: number) {
  ss.set(localName, roomId)
}
