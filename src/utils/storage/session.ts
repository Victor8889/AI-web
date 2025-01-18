import { deCrypto, enCrypto } from '@/utils'

export function setSession(key: string, value: unknown) {
  const json = enCrypto(value)
  sessionStorage.setItem(key, json)
}

export function getSession<T>(key: string) {
  const json = sessionStorage.getItem(key)
  let data: T | null = null
  if (json) {
    try {
      data = deCrypto(json)
    }
    catch {}
  }
  return data
}

export function removeSession(key: string) {
  window.sessionStorage.removeItem(key)
}

export function clearSession() {
  window.sessionStorage.clear()
}
