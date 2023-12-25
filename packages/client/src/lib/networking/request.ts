import axios from 'axios'
import { formatMessage } from '@/locales/en/messages'

const request = axios.create()

// Override timeout default for the library
// Now all requests using this request will wait 2.5 seconds before timing out
request.defaults.timeout = 2500

// Add a request interceptor
request.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    return config
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error)
  },
)

// Add a response interceptor
request.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response
  },
  function (error) {
    console.log(2222,error)
    console.log('formatMessage',formatMessage({ id: `error.${errorCode}` }))
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    return Promise.reject(error)
  },
)

export default request
