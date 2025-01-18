import type { AxiosError, AxiosResponse } from 'axios'
import { useRouter } from 'vue-router'
import type { RequestConfig } from '../../typings/axios'
import { AxiosRejectError, resolveResError } from './helpers'
import { getToken } from '@/utils/auth/token'
const route = useRouter()
/** 请求拦截 */
export function reqResolve(config: RequestConfig) {
  // 处理不需要token的请求
  if (config.noNeedToken)
    return config

  const token = getToken()
  if (!token) {
    // window.location.href = '#/login'
    // route.push('/login')
    return Promise.reject(new AxiosRejectError({ code: 401, message: '登录已过期，请先登录！' }))
  }

  /**
   * * 加上 token
   * ! 认证方案: JWT Bearer
   */
  const Authorization = config.headers?.Authorization || `Bearer ${token}`
  if (config.headers)
    config.headers.Authorization = config.headers.Authorization || `Bearer ${token}`
  else
    config.headers = { Authorization }

  return config
}

/** 请求错误拦截 */
export function reqReject(error: AxiosError) {
  return Promise.reject(error)
}

/** 响应拦截 */
export function resResolve(response: AxiosResponse) {
  // 处理不同的 response.headers
  const { data, status, config } = response
  if (!data && data?.code !== 200) {
    const code = data?.code ?? status
    /** 根据code处理对应的操作，并返回处理后的message */
    const message = resolveResError(code, data?.message)
    const { noNeedTip } = config as RequestConfig
    !noNeedTip && window.$message?.error(message)
    return Promise.reject(new AxiosRejectError({ code, message, data: data || response }))
  }

  return Promise.resolve(data)
}

/** 响应错误拦截 */
export function resReject(error: AxiosError) {
  if (!error || !error.response) {
    const code = error?.code
    /** 根据code处理对应的操作，并返回处理后的message */
    const message = resolveResError(code, error.message)
    window.$message?.error(message)
    return Promise.reject(new AxiosRejectError({ code, message, data: error }))
  }
  const { data, status, config } = error.response
  let { code, message } = data as AxiosRejectError
  code = code ?? status
  message = message ?? error.message
  message = resolveResError(code, message)
  /** 需要错误提醒 */
  const { noNeedTip } = config as RequestConfig

  if (message === '未提供 token' || message === 'token 无效') { // token 无效
    message = '登录已过期，请先登录！'
    window.location.href = '#/login'
  }
  !noNeedTip && window.$message?.error(message)
  return Promise.reject(new AxiosRejectError({ code, message, data: error.response?.data || error.response }))
}
