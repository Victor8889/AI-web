declare namespace Chat {

	interface Chat {
		id?: number
		createTime: string
		content: string
		messageType?: MessageType
		inversion?: boolean 
		error?: boolean
		loading?: boolean
		modelName?:string
		conversationOptions?: ConversationRequest | null
		requestOptions: { content: string; options?: ConversationRequest | null }
		}
		interface ChatMj {
			dateTime: string
			text: string
			inversion?: boolean
			error?: boolean
			loading?: boolean
			conversationOptions?: ConversationRequest | null
			requestOptions: { prompt: string; options?: ConversationRequest | null }
			model?:string //模型
			mjID?:string //MJ的ID
			opt?:{
				progress?:string,seed?:number, imageUrl?:string
				, status?:string, images?:string[]
				,promptEn?:string,buttons?:any[]
				,action?:string
				,duration?:number
				,lkey?:string
			} //
			uuid?:number
			index?:number
			myid?:string //唯一随机
			logo?:string
			
			//progress?:string
		}

	interface History {
		title: string
		isEdit: boolean= false

		roomId: number
		createTime?: string
		name?: string
	}

	interface ChatState {
		active: number | null
		usingContext: boolean
		history: History[]
		roomListVO?:RoomListVO[]
		chat: { roomId: number; data: Chat[] }[]
	}

	/**新版 */
	interface OpenAiChatState {
		active: number | null
		usingContext: boolean;
		history: History[]
		chat: { roomId: number; data: RoomOpenAiChatMsgVO[] }[]
	}

	interface ConversationRequest {
		conversationId?: string
		parentMessageId?: string
	}

	/* “ConversationResponse”接口定义了从对话中接收到的响应对象的结构。它包括以下属性： */
	interface ConversationResponse {
		conversationId: string
		detail: {
			choices: { finish_reason: string; index: number; logprobs: any; text: string }[]
			created: number
			id: string
			model: string
			object: string
			usage: { completion_tokens: number; prompt_tokens: number; total_tokens: number }
		}
		id: string
		parentMessageId: string
		role: string
		text: string
	}

	/**房间列表返回 */
	 interface RoomListResponse {
		/**
		 * 状态码
		 */
		code?: number
		data?: IPageRoomListVO
		/**
		 * 返回消息
		 */
		message?: string
	  }
	  /**
* 承载数据
*/
 interface IPageRoomListVO {
	current?: number
	pages?: number
	records?: RoomListVO[]
	size?: number
	total?: number
  }
  /**
  * 房间列表展示对象
  */
  interface RoomListVO {
	/**
	 * cell code
	 */
	cellCode?: string
	/**
	 * 颜色，十六进制
	 */
	color?: string
	/**
	 * 创建时间
	 */
	createTime?: string
	/**
	 * 房间 id
	 */
	roomId: number
	/**
	 * 是否固定 false 否 true 是
	 */
	isPinned?: boolean
	/**
	 * 名称
	 */
	name?: string
	// 是否是编辑状态
	isEdit?: boolean
  }
  /**
 * 编辑房间请求参数
 */
 interface editRoomVo {
	/**
	 * 房间配色
	 */
	color?: string
	/**
	 * 房间名称
	 */
	name: string
	/**
	 * 房间 id
	 */
	roomId: number
  }
  
  /**
 * 房间创建请求参数
 * feiqi
 */
 interface addRoomVo {
	name?: string = 'New Room',
	color?: string = '#fead0b',
	cellConfigCode: String = 'gpt-3.5',
	/**
	 * cell code
	 */
	// cellCode: CellCode2 | undefined
	// /**
	//  * 房间配置参数列表
	//  */
	// roomConfigParams: RoomConfigParamRequest[] | undefined
	// roomInfo: RoomInfoRequest
  }
  export enum CellCode2 {
	Midjourney = 'Midjourney',
	NewBing = 'new_bing',
	OpenaiChatWeb3_5 = 'openai_chat_web_3_5',
	OpenaiChatWeb4 = 'openai_chat_web_4',
	OpenaiChatapi3_5 = 'openai_chat_api_3_5',
	OpenaiChatapi4 = 'openai_chat_api_4',
  }
  /**
* 房间配置参数请求参数
*/
export interface RoomConfigParamRequest {
	/**
	 * 配置项 code
	 */
	cellConfigCode: string
	/**
	 * 是否使用默认值
	 */
	isDefaultValue: boolean
	/**
	 * 配置项值
	 */
	value?: string
  }
  /**
* 房间信息请求参数
*/
export interface RoomInfoRequest {
	/**
	 * 房间配色
	 */
	color?: string | undefined
	/**
	 * 房间名称
	 */
	name: string | undefined
  }

   interface RoomOpenaiChatListRequest {
	cursor: string
	isAsc: boolean
	isUseCursor: boolean
	roomId: number | string
	size: number
  }
  /**
 * 编辑房间请求参数
 */
export interface editRoomVo {
	/**
	 * 房间配色
	 */
	color?: string
	/**
	 * 房间名称
	 */
	name: string
	/**
	 * 房间 id
	 */
	roomId: number
  }
  /**
   * 响应结果
   */
   interface RoomOpenaiChatListResponse {
	/**
	 * 状态码
	 */
	code?: number
	/**
	 * 承载数据
	 */
	data?: RoomOpenAiChatMsgVO[]
	/**
	 * 返回消息
	 */
	message?: string
  }
  
  /**
  * OpenAi 对话房间消息展示参数
  */
   interface RoomOpenAiChatMsgVO {
	/**
	 * 消息内容
	 */
	content?: string
	/**
	 * 创建时间
	 */
	createTime?: Date
	/**
	 * 主键
	 */
	id?: number
	
	modelName?:string
	/**
	 * 消息类型
	 */
	messageType?: MessageType
	inversion?: boolean = false
		error?: boolean = false
		loading?: boolean = false
		conversationOptions?: ConversationRequest | null
		requestOptions: { content: string; options?: ConversationRequest | null }
  }
  
  /**
  * 消息类型
  */
   enum MessageType {
	Answer = 'answer',
	Question = 'question',
  }
  
   interface sendRequest {
	/**
	 * 消息内容
	 */
	content: string
	/**
	 * 房间 id
	 */
	roomId: number | string
  }
  
	interface userParamState{
		username: string
		roomId: number
		total:number
		userParam: UserParam
		nightMode:boolean 
		isMj:boolean
	  }
   interface UserParam {
	id?: number | string
	systemMessage?: string
	apikey?: string
	temperature?: number | string
	contextCount?: number
	presencePenalty?: number | string
	chatModel?: string
	isContext?:number | string
  }
  export interface personInfo {
	/**
	 * 提示语
	 */
	remainHoldBi: string
	/**
	 * 房间 id
	 */
	inviteEncode:  string
	userName: string
	validyDate: string
	isVip: string
  }
  export interface password {
	oldpass:  string
	newpass: string
  }
  
  export interface getPage {
	pageNum: number
	pageSize: number
  }
}
