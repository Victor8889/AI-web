/*
 * @Description: chat相关数据 聊天记录等
 */
import { defineStore } from 'pinia'
import api from '../../../components/Setting/api'
import { getLocalState, getParLocalState, setLocalState, setParLocalState } from './helper'
import { router } from '@/router'

// 创建一个名为userParStore的用户参数存储模块
export const userParStore = defineStore({
  id: 'user-param', // 定义模块的唯一标识符
  state: (): Chat.userParamState => getParLocalState(),

  getters: {

    // 定义一个名为getUUID的getter，用于获取当前的uuid
    getUUID(state: Chat.userParamState) {
      return state.roomId // Corrected: Return the uuid from the state object.
    },

    // 定义一个名为getUserParam的getter，用于获取当前的userParam
    async getUserParam(state: Chat.userParamState) {
      if (!state.userParam?.id) {
        try {
          const uparam: Chat.UserParam = await api.getUserPram() // Corrected: Change 'getUserPram()' to 'getUserParam()'
          this.userParam = uparam.data // Corrected: Assign the fetched userParam to the state.
          this.recordState()
          return this.userParam || null // Corrected: Return chatModel data or null if it's empty.
        }
        catch (error) {
          console.error('获取参数错误:', error)
          return null // Corrected: Return null if an error occurs during fetching.
        }
      } // 等待获取数据的异步操作完成

      return state.userParam // 返回state中的userParam
    },
    getTotal(state: Chat.userParamState) {
      return state.total
    },
    getModel(state: Chat.userParamState) {
      return state.nightMode
    },
  },

  actions: {
    // 定义一个名为addUser的action，用于添加用户参数
    addUser(username: string) {
      this.username = username
      this.userParam = null // Corrected: Reset userParam to null when adding a new user.
      this.roomId = 0 // Corrected: Reset uuid to 0 when adding a new user.
      this.recordState()
    },
    // 定义一个名为addParam的action，用于添加用户参数
    addParam(userParam: Chat.UserParam) {
      this.userParam = {
        ...this.userParam,
        ...userParam,
      }
      this.userParam.chatModel = userParam.chatModel
      this.recordState()
    },
    addTotal(total: number) {
      this.total = total
      this.recordState()
    },
    // 定义一个名为updateUUID的action，用于修改uuid
    updateUUID(roomId: number) {
      this.roomId = roomId
      this.recordState()
    },
    // 定义一个名为updateUUID的action，用于修改uuid
    updateModel(isMj: boolean) {
      this.isMj = isMj
      this.recordState()
    },
    updateNight(nightMode: boolean) {
      this.nightMode = nightMode
      this.recordState()
    },

    async fetchUserParamFromDatabase() {
      try {
        const uparam: Chat.UserParam = await api.getUserPram() // Corrected: Change 'getUserPram()' to 'getUserParam()'
        this.userParam = uparam.data // Corrected: Assign the fetched userParam to the state.
        this.recordState()
        return this.userParam || null // Corrected: Return chatModel data or null if it's empty.
      }
      catch (error) {
        console.error('获取参数错误:', error)
        return null // Corrected: Return null if an error occurs during fetching.
      }
    },
    // 定义一个名为recordState的action，用于记录用户参数状态
    recordState() {
      setParLocalState(this.$state) // Corrected: Call the correct 'setParLocalState()' function to save the state.
    },
  },
})
// 房间 对话存储块
export const useChatStore = defineStore({
  id: 'chat-store', // 定义模块的唯一标识符
  state: (): Chat.ChatState => getLocalState(),

  getters: {
    getChatHistoryByCurrentActive(state: Chat.ChatState) {
      const index = state.history.findIndex(item => item.roomId === state.active)
      if (index !== -1)
        return state.history[index]
      return null
    },

    getChatByUuid(state: Chat.ChatState) {
      return (roomId?: number) => {
        if (roomId)
          return state.chat.find(item => item.roomId === roomId)?.data ?? []
        return state.chat.find(item => item.roomId === state.active)?.data ?? []
      }
    },
  },

  actions: {
    setUsingContext(context: boolean) {
      this.usingContext = context
      this.recordState()
    },

    addHistory(history: Chat.History, chatData: Chat.Chat[] = []) {
      // this.history.unshift(history) //ll注释，只创建新界面但是不创建新房间组件呢，后面在创建
      this.chat.unshift({ roomId: history.roomId, data: chatData })
      this.active = history.roomId
      this.reloadRoute(history.roomId)
    },
    addHistoryList(roomId: number, chatData: Chat.Chat[] = []) {
      // this.history.unshift(history)
      this.chat.unshift({ roomId, data: chatData })
      this.active = roomId
      this.reloadRoute(roomId)
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

    /* “useChatStore”模块中的“getChatByUuidAndIndex”函数用于根据给定的“uuid”（唯一标识符）和“index”值从聊天历史记录中检索特定的聊天消息。 */
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
    addChatByUuid(roomId: number, chat: Chat.Chat) {
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
          //  if (this.history[0].title === 'New Chat')
          //   this.history[0].title = chat.content
          this.recordState()
        }
      }

      const index = this.chat.findIndex(item => item.roomId === roomId)
      if (index !== -1) {
        this.chat[index].data.push(chat)
        // if (this.history[index].title === 'New Chat')
        //  this.history[index].title = chat.content
        this.recordState()
      }
    },
    // 新增方法：用于将Chat.Chat[]数组添加到特定uuid的聊天历史记录中
    addChatListByUuid(roomId: number, chats: Chat.Chat[], isStart: boolean) {
      const chatIndex = this.chat.findIndex(item => item.roomId === roomId)
      if (!isStart) {
        // 如果没有提供uuid或者uuid为0，则将聊天消息添加到第一个聊天历史记录中
        if (chatIndex === -1) {
        // const newUuid = Date.now()
        // this.history.push({ uuid, title: 'New Chat', isEdit: false })
          this.chat.push({ roomId, data: chats.slice().reverse() })
          this.active = roomId
        }
        else {
          this.chat[chatIndex].data = chats.slice().reverse()
        }
      }
      else {
        // 如果提供了uuid，则找到对应的聊天历史记录并添加聊天消息

        if (chatIndex !== -1)
          this.chat[chatIndex].data.unshift(...chats.slice().reverse()) // 使用扩展运算符将新的聊天消息数组添加到现有聊天消息数组中
      }

      this.recordState()
    },

    addRoom(history: Chat.History[]) {
      if (this.history.length === 1)
        this.history = [...this.history, ...history]
      else
        this.history = [...history]
      this.recordState()
    },
    updateRoom(history: Chat.History[]) {
      this.history = [...this.history, ...history]
      this.recordState()
    },
    newHistory(history: Chat.History, chatData: Chat.Chat[] = []) {
      if (history.roomId === -999999) {
        const rid = this.history[0]?.roomId
        if (history.roomId === rid) { this.active = history.roomId }
        else {
          this.history.unshift(history)
          this.chat.unshift({ roomId: history.roomId, data: chatData })
          this.active = history.roomId
        }
        this.reloadRoute(history.roomId)
      }
    },
    async updateHistorySome(roomId: number, oldRoomId: number, data: Chat.editRoomVo) {
      const index = this.history.findIndex(item => item.roomId === oldRoomId)
      if (roomId === -111 && index !== -1) {
        this.history[index].name = data.name
        return
      }
      if (index !== -1) {
        // 更新history的roomId
        this.history[index].name = data.name
        this.history[index].roomId = roomId
        this.active = roomId
        // 找到对应的this.chat项，并更新roomId
        const chatIndex = this.chat.findIndex(item => item.roomId === oldRoomId)
        if (chatIndex !== -1)
          this.chat[chatIndex].roomId = roomId
        this.active = roomId
        this.reloadRoute(roomId)
      }
    },
    updateChatByUuid(roomId: number, index: number, chat: Chat.Chat) {
      if (!roomId || roomId === 0) {
        if (this.chat.length) {
          this.chat[0].data[index] = chat
          this.recordState()
        }
        return
      }

      const chatIndex = this.chat.findIndex(item => item.roomId === roomId)
      if (chatIndex !== -1) {
        if (index === -1)
          index = 1
        this.chat[chatIndex].data[index] = chat
        this.recordState()
      }
    },

    updateChatSomeByUuid(roomId: number, index: number, chat: Partial<Chat.Chat>) {
      if (!roomId || roomId === 0) {
        if (this.chat.length) {
          this.chat[0].data[index] = { ...this.chat[0].data[index], ...chat }
          this.recordState()
        }
        return
      }

      const chatIndex = this.chat.findIndex(item => item.roomId === roomId)
      if (chatIndex !== -1) {
        if (index === -1)
          index = 1
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
    clearRoom() {
      this.history = []
      this.chat = []
      this.recordState()
    },

    clearChat() {
      this.chat = []
      this.recordState()
    },

    async reloadRoute(roomId?: number) {
      this.recordState()
      await router.push({ name: 'Chat', params: { roomId } })
    },

    recordState() {
      setLocalState(this.$state)
    },
  },
})
