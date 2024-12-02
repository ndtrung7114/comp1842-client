import { axiosInstance, axiosPrivateInstance } from "../utils/axios";
import {useAuthStore} from '../stores/auth'
import { watchEffect } from "vue";
import type { AxiosInstance } from "axios";

// Define a function that returns a private Axios instance with authentication
export function useApiPrivate(): AxiosInstance  {
  // Get the authentication store to access authentication methods and state
  const authStore = useAuthStore()

  // Use watchEffect to set up reactive interceptors that will update when dependencies change
  watchEffect(()=>{
    // Add request interceptor to axiosPrivateInstance
    axiosPrivateInstance.interceptors.request.use(
      // Interceptor for modifying request configuration
      (config) => {
        // Check if Authorization header is not already set
        if(!config.headers["Authorization"]){
          // Add Bearer token from auth store to the headers
          config.headers["Authorization"] = `Bearer ${authStore.accessToken}`
        }
        // Return the modified config
        return config
      },
      // Error handler for request interceptor
      (error) => Promise.reject(error)
    )
  
    // Add response interceptor to handle authentication errors
    axiosPrivateInstance.interceptors.response.use(
      // Successful response handler (just pass through the response)
      response => response,
      // Error handler for responses
      async (error) => {
        // Store the original request configuration
        const prevRequest = error?.config

        // Check if the error is an authentication error (403 or 401) 
        // and the request hasn't been retried before
        if((error?.response?.status === 403 || error?.response?.status === 401) && !prevRequest.sent){
          // Mark the request as sent to prevent infinite retry loops
          prevRequest.sent = true

          try {
            // Attempt to refresh the access token
            await authStore.refresh()

            // Update the Authorization header with the new access token
            prevRequest.headers["Authorization"] = authStore.accessToken

            // Retry the original request with the new token
            return axiosPrivateInstance(prevRequest)
          } catch (error) {
            // If token refresh fails, reject the promise
            return Promise.reject(error)
          }
        }
  
        // For other errors, reject the promise
        return Promise.reject(error)
      }
    )
  })

  // Return the configured private Axios instance
  return axiosPrivateInstance
}

// Function to return a public Axios instance without authentication
export function useApi(){
  // Simply return the public Axios instance
  return axiosInstance
}