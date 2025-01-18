/*
 * @Author: lk
 * @LastEditTime: 2023-04-08 15:04:34
 * @FilePath: \wm-ai\src\store\modules\chat\index.ts
 * @Description: chat相关数据 聊天记录等
 */
import { defineStore } from 'pinia'
import { getLocalStateChat, setLocalStateChat } from './helper'
import { router } from '@/router'

export const useChatStore = defineStore('chat-store', {
  state: (): Chat.OpenAiChatState => getLocalStateChat(),

  getters: {
    getChatHistoryByCurrentActive(state: Chat.OpenAiChatState) {
      const index = state.history.findIndex(item => item.roomId === state.active)
      if (index !== -1)
        return state.history[index]
      return null
    },

    getChatByUuid(state: Chat.OpenAiChatState) {
      return (roomId?: number) => {
        if (roomId)
          return state.chat.find(item => item.roomId === roomId)?.data ?? []
        return state.chat.find(item => item.roomId === state.active)?.data ?? []
      }
    },
    /** 新版 */
    // getChatListByUuid(state: Chat.OpenAiOpenAiChatState) {
    //   return (uuid?: number) => {
    //     if (uuid)
    //       return state.chat.find(item => item.uuid === uuid)?.data ?? []
    //     return state.chat.find(item => item.uuid === state.active)?.data ?? []
    //   }
    // },
  },

  actions: {
    setUsingContext(context: boolean) {
      this.usingContext = context
      this.recordState()
    },

    addHistory(history: Chat.History, chatData: Chat.RoomOpenAiChatMsgVO[] = []) {
      this.history.unshift(history)
      this.chat.unshift({ roomId: history.roomId, data: chatData })
      this.active = history.roomId
      this.reloadRoute(history.roomId)
    },

    updateHistory(roomId: number, edit: Partial<Chat.History>) {
      const index = this.history.findIndex(item => item.roomId === roomId)
      if (index !== -1) {
        this.history[index] = { ...this.history[index], ...edit }
        this.recordState()
      }
    },

    async deleteHistory(index: number) {
      this.history.splice(index, 1)
      this.chat.splice(index, 1)

      if (this.history.length === 0) {
        this.active = null
        this.reloadRoute()
        return
      }

      if (index > 0 && index <= this.history.length) {
        const roomId = this.history[index - 1].roomId
        this.active = roomId
        this.reloadRoute(roomId)
        return
      }

      if (index === 0) {
        if (this.history.length > 0) {
          const roomId = this.history[0].roomId
          this.active = roomId
          this.reloadRoute(roomId)
        }
      }

      if (index > this.history.length) {
        const roomId = this.history[this.history.length - 1].roomId
        this.active = roomId
        this.reloadRoute(roomId)
      }
    },

    async setActive(roomId: number) {
      this.active = roomId
      return await this.reloadRoute(roomId)
    },

    /* “useChatStore”模块中的“getChatByroomIdAndIndex”函数用于根据给定的“roomId”（唯一标识符）和“index”值从聊天历史记录中检索特定的聊天消息。 */
    getChatByUuidAndIndex(roomId: number, index: number) {
      if (!roomId || roomId === 0) {
        if (this.chat.length)
          return this.chat[0].data[index]
        return null
      }
      const chatIndex = this.chat.findIndex(item => item.roomId === roomId)
      if (chatIndex !== -1)
        return this.chat[chatIndex].data[index]
      return null
    },

    /* useChatStore 存储模块中的 addChatByUuid 函数负责将新的聊天消息添加到聊天历史记录中。 */
    addChatByUuid(roomId: number, chat: Chat.RoomOpenAiChatMsgVO) {
      if (!roomId || roomId === 0) {
        if (this.history.length === 0) {
          const roomId = Date.now()
          this.history.push({ roomId, title: chat.content, isEdit: false })
          this.chat.push({ roomId, data: [chat] })
          this.active = roomId
          this.recordState()
        }
        else {
          this.chat[0].data.push(chat)
          if (this.history[0].title === 'New Chat')
            this.history[0].title = chat.content
          this.recordState()
        }
      }

      const index = this.chat.findIndex(item => item.roomId === roomId)
      if (index !== -1) {
        this.chat[index].data.push(chat)
        if (this.history[index].title === 'New Chat')
          this.history[index].title = chat.content
        this.recordState()
      }
    },

    updateChatByUuid(roomId: number, index: number, chat: Chat.RoomOpenAiChatMsgVO) {
      if (!roomId || roomId === 0) {
        if (this.chat.length) {
          this.chat[0].data[index] = chat
          this.recordState()
        }
        return
      }

      const chatIndex = this.chat.findIndex(item => item.roomId === roomId)
      if (chatIndex !== -1) {
        this.chat[chatIndex].data[index] = chat
        this.recordState()
      }
    },

    updateChatSomeByUuid(roomId: number, index: number, chat: Partial<Chat.RoomOpenAiChatMsgVO>) {
      if (!roomId || roomId === 0) {
        if (this.chat.length) {
          this.chat[0].data[index] = { ...this.chat[0].data[index], ...chat }
          this.recordState()
        }
        return
      }

      const chatIndex = this.chat.findIndex(item => item.roomId === roomId)
      if (chatIndex !== -1) {
        this.chat[chatIndex].data[index] = { ...this.chat[chatIndex].data[index], ...chat }
        this.recordState()
      }
    },

    deleteChatByUuid(roomId: number, index: number) {
      if (!roomId || roomId === 0) {
        if (this.chat.length) {
          this.chat[0].data.splice(index, 1)
          this.recordState()
        }
        return
      }

      const chatIndex = this.chat.findIndex(item => item.roomId === roomId)
      if (chatIndex !== -1) {
        this.chat[chatIndex].data.splice(index, 1)
        this.recordState()
      }
    },

    clearChatByUuid(roomId: number) {
      if (!roomId || roomId === 0) {
        if (this.chat.length) {
          this.chat[0].data = []
          this.recordState()
        }
        return
      }

      const index = this.chat.findIndex(item => item.roomId === roomId)
      if (index !== -1) {
        this.chat[index].data = []
        this.recordState()
      }
    },

    async reloadRoute(roomId?: number) {
      this.recordState()
      await router.push({ name: 'Chat', params: { roomId } })
    },

    recordState() {
      setLocalStateChat(this.$state)
    },
  },
})
