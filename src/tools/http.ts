import axios from "axios"
import { getUserAgent } from "./getUserAgent"
import setCookieParser from 'set-cookie-parser'
import { logger } from "../log_setting/log"
import { Global } from "./global"
export const getReq = (reqUrl: string, params: Object | null, referer: string = `https://www.jd.com`, isDisableRedirects: boolean = false) => {
   let http = axios.create(
      {
         method: "GET",
         maxRedirects: isDisableRedirects ? 0 : 5,
      }
   )
   http.interceptors.request.use((config) => {
      config.headers['User-Agent'] = getUserAgent();
      config.headers['Referer'] = referer;

      if (Global.jsk.cookies) {
         config.headers['cookies'] = Global.jsk.cookies
      }
      return config;
   })
   http.interceptors.response.use(async (response) => {
      if (response.status != 200) {
         logger.debug(`"httpCode": ${response.status} "reqUrl": ${response.config.url}`)
      }
      // setting cookies
      let setCookies = response.headers['set-cookie']
      let cookiesArray = setCookieParser.parse(setCookies)
      let cookies = cookiesArray.map((item) => {
         return {
            name: item.name,

            value: item.value,

            path: item.path,
            expires: Math.floor(new Date(item.expires || '').getTime() / 1000),
            maxAge: item.maxAge,
            domain: item.domain,
            secure: item.secure,
            httpOnly: item.httpOnly,
         }
      })
      // if (setCookies) {
      await Global.jsk.page.setCookie(...cookies)
      Global.jsk.cookies = await Global.jsk.page.cookies()
      // }
      return response
   })
   return http({
      url: reqUrl,
      params,
   })
}

export const postReq = (reqUrl: string, data: Object, referer: string = `https://www.jd.com`, isDisableRedirects: boolean = false) => {
   let http = axios.create(
      {
         method: "POST",
         maxRedirects: isDisableRedirects ? 0 : 5,
      }
   )
   http.interceptors.request.use(async (config) => {
      config.headers['User-Agent'] = getUserAgent();
      config.headers['Referer'] = referer;
      config.headers['Content-Type'] = "application/x-www-form-urlencoded"
      let cookies = await Global.jsk.page.cookies()
      if (Global.jsk.cookies) {
         config.headers['cookies'] = cookies.map((item) => {
            return `${item.name}=${item.value}; path=${item.path}; `
         }).join('')
      }

      return config;
   })
   http.interceptors.response.use(async (response) => {
      if (response.status != 200) {
         logger.debug(`"httpCode": ${response.status} "reqUrl": ${response.config.url}`)
      }
      // setting cookies
      let setCookies = response.headers['set-cookie']
      let cookiesArray = setCookieParser.parse(setCookies)
      let cookies = cookiesArray.map((item) => {
         return {
            name: item.name,

            value: item.value,

            path: item.path,
            expires: Math.floor(new Date(item.expires || '').getTime() / 1000),
            maxAge: item.maxAge,
            domain: item.domain,
            secure: item.secure,
            httpOnly: item.httpOnly,
         }
      })
      // if (setCookies) {
      await Global.jsk.page.setCookie(...cookies)
      Global.jsk.cookies = await Global.jsk.page.cookies()
      return response
   })
   return http({
      url: reqUrl,
      data
   })
}