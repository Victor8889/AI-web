import { deCrypto, enCrypto } from '../crypto'

interface StorageData<T = any> {
  data: T
  expire: number | null
}

export function createLocalStorage(options?: { expire?: number | null; crypto?: boolean }) {
  const DEFAULT_CACHE_TIME = 60 * 60 * 24 * 7

  const { expire, crypto } = Object.assign(
    {
      expire: DEFAULT_CACHE_TIME,
      crypto: true,
    },
    options,
  )

  function set<T = any>(key: string, data: T) {
    const storageData: StorageData<T> = {
      data,
      expire: expire !== null ? new Date().getTime() + expire * 1000 : null,
    }

    const json = crypto ? enCrypto(storageData) : JSON.stringify(storageData)
    window.localStorage.setItem(key, json)
  }

  function get(key: string) {
    const json = window.localStorage.getItem(key)
    if (json) {
      let storageData: StorageData | null = null

      try {
        storageData = crypto ? deCrypto(json) : JSON.parse(json)
      }
      catch {
        // Prevent failure
      }

      if (storageData) {
        const { data, expire } = storageData
        if (expire === null || expire >= Date.now())
          return data
      }

      remove(key)
      return null
    }
  }

  function remove(key: string) {
    window.localStorage.removeItem(key)
  }

  function clear() {
    window.localStorage.clear()
  }

  return {
    set,
    get,
    remove,
    clear,
  }
}

export const ls = createLocalStorage()

export const ss = createLocalStorage({ expire: null, crypto: false })

/** 新版本 */

/** 默认缓存期限为7天 */
const DEFAULT_CACHE_TIME = 60 * 60 * 24 * 7
export function setLocal(key: string, data: unknown, expire: number | null = DEFAULT_CACHE_TIME) {
  const storageData: StorageData = { data, expire: expire !== null ? new Date().getTime() + expire * 1000 : null }
  const json = enCrypto(storageData)
  window.localStorage.setItem(key, json)
}

export function getLocal<T>(key: string) {
  const json = window.localStorage.getItem(key)
  if (json) {
    let storageData: StorageData | null = null
    try {
      storageData = deCrypto(json)
    }
    catch {}
    if (storageData) {
      const { data, expire } = storageData
      // 没有过期时间或者在有效期内则直接返回
      if (expire === null || expire >= Date.now())
        return data as T
    }
    removeLocal(key)
    return null
  }
  return null
}

export function getLocalExpire(key: string): number | null {
  const json = window.localStorage.getItem(key)
  if (json) {
    let storageData: StorageData | null = null
    try {
      storageData = deCrypto(json)
    }
    catch {}
    if (storageData) {
      const { expire } = storageData
      return expire
    }
    return null
  }
  return null
}

export function removeLocal(key: string) {
  window.localStorage.removeItem(key)
}

export function clearLocal() {
  window.localStorage.clear()
}
