/*
 * @Author: lk
 * @LastEditTime: 2023-04-09 14:17:50
 * @FilePath: \wm-ai\src\views\chat\hooks\useChat.ts
 * @Description: 使用chat相关函数
 */
import { useChatStore } from '@/store'

export function useChat() {
  const chatStore = useChatStore()

  const getChatByUuidAndIndex = (roomId: number, index: number) => {
    return chatStore.getChatByUuidAndIndex(roomId, index)
  }

  const addChat = (roomId: number, chat: Chat.Chat) => {
    chatStore.addChatByUuid(roomId, chat)
  }

  const addChatList = (roomId: number, chat: Chat.Chat[]) => {
    chatStore.addChatByUuid(roomId, chat)
  }

  const updateChat = (roomId: number, index: number, chat: Chat.Chat) => {
    chatStore.updateChatByUuid(roomId, index, chat)
  }

  const updateChatSome = (roomId: number, index: number, chat: Partial<Chat.Chat>) => {
    chatStore.updateChatSomeByUuid(roomId, index, chat)
  }
  const updatHistorySome = (roomId: number, oldId: number, data: Chat.editRoomVo) => {
    chatStore.updateHistorySome(roomId, oldId, data)
  }

  return {
    addChat,
    updateChat,
    updateChatSome,
    getChatByUuidAndIndex,
    updatHistorySome,
  }
}
