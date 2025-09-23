import { useState, useCallback } from 'react'

export interface ApiResponse<T = any> {
  data: T | null
  loading: boolean
  error: string | null
}

export type ApiService = 'onboarding' | 'iot-analytics' | 'auth'

export interface ApiRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: any
  token?: string | null
  baseURL?: string
  service?: ApiService
}

export interface UseApiReturn<T = any> {
  data: T | null
  loading: boolean
  error: string | null
  request: (url: string, config?: ApiRequestConfig) => Promise<T | null>
  reset: () => void
}

const SERVICE_BASE_URLS: Record<ApiService, string> = {
  onboarding: process.env.NEXT_PUBLIC_API_ONBOARDING || 'http://10.159.108.249:8668',
  'iot-analytics': process.env.NEXT_PUBLIC_API_IOT_ANALYTICS || 'http://10.159.110.175:7704',
  auth: process.env.NEXT_PUBLIC_API_AUTH || 'http://10.159.108.249:8666',
}

const defaultBaseURL = process.env.NEXT_PUBLIC_API_BASE_URL || ''

export function useApi<T = any>(initialConfig?: ApiRequestConfig): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const request = useCallback(async (url: string, config?: ApiRequestConfig): Promise<T | null> => {
    setLoading(true)
    setError(null)

    try {
      const {
        method = 'GET',
        headers = {},
        body,
        token,
        baseURL,
        service,
      } = { ...initialConfig, ...config }

      // Get token from localStorage if not provided
      const authToken = token !== undefined ? token : (typeof window !== 'undefined' ? localStorage.getItem('token') : null)

      const requestHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...headers,
      }

      // Add authorization header if token exists
      if (authToken) {
        requestHeaders.Authorization = `Bearer ${authToken}`
      }

      const requestConfig: RequestInit = {
        method,
        headers: requestHeaders,
      }

      // Add body for non-GET requests
      if (body && method !== 'GET') {
        requestConfig.body = typeof body === 'string' ? body : JSON.stringify(body)
      }

      // Resolve base URL: prefer explicit baseURL, else service, else default
      const resolvedBaseURL = baseURL || (service ? SERVICE_BASE_URLS[service] : defaultBaseURL)

      const response = await fetch(`${resolvedBaseURL}${url}`, requestConfig)

      // Handle non-2xx responses
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorData.error || errorMessage
        } catch {
          // If response is not JSON, use the default error message
        }

        throw new Error(errorMessage)
      }

      // Handle different response types
      const contentType = response.headers.get('content-type')
      let responseData: T

      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json()
      } else {
        responseData = (await response.text()) as T
      }

      setData(responseData)
      return responseData

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [initialConfig])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  return {
    data,
    loading,
    error,
    request,
    reset
  }
}

// Convenience hooks for specific HTTP methods
export function useGet<T = any>(url?: string, config?: Omit<ApiRequestConfig, 'method'>) {
  const api = useApi<T>(config)
  
  const get = useCallback((requestUrl?: string) => {
    return api.request(requestUrl || url || '', { ...config, method: 'GET' })
  }, [api, url, config])

  return {
    ...api,
    get
  }
}

export function usePost<T = any>(config?: Omit<ApiRequestConfig, 'method'>) {
  const api = useApi<T>(config)
  
  const post = useCallback((url: string, body?: any, requestConfig?: Omit<ApiRequestConfig, 'method' | 'body'>) => {
    return api.request(url, { ...config, ...requestConfig, method: 'POST', body })
  }, [api, config])

  return {
    ...api,
    post
  }
}

export function usePut<T = any>(config?: Omit<ApiRequestConfig, 'method'>) {
  const api = useApi<T>(config)
  
  const put = useCallback((url: string, body?: any, requestConfig?: Omit<ApiRequestConfig, 'method' | 'body'>) => {
    return api.request(url, { ...config, ...requestConfig, method: 'PUT', body })
  }, [api, config])

  return {
    ...api,
    put
  }
}

export function useDelete<T = any>(config?: Omit<ApiRequestConfig, 'method'>) {
  const api = useApi<T>(config)
  
  const del = useCallback((url: string, requestConfig?: Omit<ApiRequestConfig, 'method'>) => {
    return api.request(url, { ...config, ...requestConfig, method: 'DELETE' })
  }, [api, config])

  return {
    ...api,
    delete: del
  }
}

export function usePatch<T = any>(config?: Omit<ApiRequestConfig, 'method'>) {
  const api = useApi<T>(config)
  
  const patch = useCallback((url: string, body?: any, requestConfig?: Omit<ApiRequestConfig, 'method' | 'body'>) => {
    return api.request(url, { ...config, ...requestConfig, method: 'PATCH', body })
  }, [api, config])

  return {
    ...api,
    patch
  }
}

// Convenience: service-specific hooks
export const useOnboardingApi = <T = any>(config?: Omit<ApiRequestConfig, 'service'>) =>
  useApi<T>({ ...config, service: 'onboarding' })

export const useIotAnalyticsApi = <T = any>(config?: Omit<ApiRequestConfig, 'service'>) =>
  useApi<T>({ ...config, service: 'iot-analytics' })

export const useAuthApi = <T = any>(config?: Omit<ApiRequestConfig, 'service'>) =>
  useApi<T>({ ...config, service: 'auth' })
