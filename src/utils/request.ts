import { GM_xmlhttpRequest } from '$';

export interface Opts {
  url: string
  method?: 'GET' | 'POST'
  params?: any
}

export function request(opts: Opts) {
  let { url, method, params } = opts

  if (params) {
    let u = new URL(url)
    Object.keys(params).forEach((key) => {
      const value = params[key]
      if (value !== undefined && value !== null) {
        u.searchParams.set(key, params[key])
      }
    })
    url = u.toString()
  }
  console.log('请求地址: ', url)
  return new Promise<any>((resolve, reject) => {
    GM_xmlhttpRequest({
      url,
      method: method || 'GET',
      responseType: 'json',
      onload: (res: any) => {
        if (process.env.NODE_ENV === 'development') {
          // console.log(res, res.response)
        }
        resolve(res.response)
      },
      onerror: reject,
    })
  })
}
