import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
  AxiosRequestHeaders,
} from 'axios'
import NProgress from '@/config/nprogress'
import 'nprogress/nprogress.css'
import { UserStore } from '@/stores/modules/user'
import { ElMessage } from 'element-plus'

const instance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  timeout: 20000,
  headers: {
    Accept: 'application/json, text/plain, */*',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: false,
})
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    NProgress.start()
    if (config.url?.includes('/user/login')) {
      return config
    }
    const userStore = UserStore()
    const token = userStore.userInfo?.token

    if (token) {
      if (!config.headers) {
        config.headers = {} as AxiosRequestHeaders
      }
      config.headers.Authorization = token
    }
    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)
instance.interceptors.response.use(
  (response) => {
    NProgress.done()
    const { data } = response
    return data
  },
  (error) => {
    NProgress.done()

    if (error.response) {
      switch (error.response.status) {
        case 401:
          if (!error.config.url?.includes('/user/login')) {
            const userStore = UserStore()
            userStore.clearUserInfo()
            ElMessage.error('Your session expired. Please sign in again.')
          } else {
            ElMessage.error('Incorrect email or password')
          }
          break
        case 403:
          ElMessage.error('Access denied')
          break
        case 404:
          ElMessage.error('Resource not found')
          break
        case 500:
          ElMessage.error('Server error')
          break
        default:
          ElMessage.error('Network error')
      }
    } else {
      ElMessage.error('Connection failed')
    }

    return Promise.reject(error)
  }
)
export const http = <T>(
  method: 'get' | 'post' | 'put' | 'delete' | 'patch',
  url: string,
  config?: Omit<AxiosRequestConfig, 'method' | 'url'>
): Promise<T> => {
  return instance({ method, url, ...config })
}
export const httpGet = <T>(url: string, params?: object): Promise<T> =>
  instance.get(url, { params })
export const httpPost = <T>(
  url: string,
  data?: object,
  header?: object
): Promise<T> => instance.post(url, data, { headers: header })
export const httpUpload = <T>(
  url: string,
  formData: FormData,
  header?: object
): Promise<T> => {
  return instance.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      ...header,
    },
  })
}
