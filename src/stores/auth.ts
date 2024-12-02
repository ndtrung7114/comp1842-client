import { defineStore } from 'pinia'
import { useApi, useApiPrivate } from '../composables/useApi'
import { socket } from '@/plugins/socket' // Import the socket instance

// Define the user object structure
export interface User {
  user: {
    _id: string
    username: string
    profile: {
      facebook: string
      avatar: string
      cover_picture: string
      location: string
      website: string
      date_of_birth: string
    }
    email: string
    first_name: string
    last_name: string
    full_name?: string
    role: string
    followers?: number
    likedPosts?: string[]
    posts: string[]
    isBan: boolean
  }
}

export interface UserView {
  userView: {
    id: string
    username: string
    profile: {
      facebook: string
      avatar: string
    }
    email: string
    first_name: string
    last_name: string
    full_name?: string
    role: string
    followers?: []
    following?: []
    likedPosts?: string[]
    posts: string[]
  }
}

export interface State {
  user: User
  userView: UserView
  accessToken: string
  authReady: boolean
}

export interface LoginData {
  email: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  first_name: string
  last_name: string
  password: string
  password_confirm: string
}

interface PasswordUpdateData {
  current_password: string
  new_password: string
  new_password_confirmation: string
}

export const useAuthStore = defineStore('auth', {
  state: (): State => {
    return {
      user: {} as User,
      userView: {} as UserView,
      accessToken: '' as string,
      authReady: false as boolean
    }
  },

  getters: {
    userDetail: (state: State) => state.user,
    userDetailView: (state: State) => state.userView,
    isAuthenticated: (state: State) => (state.accessToken ? true : false)
  },

  actions: {
    async attempt() {
      try {
        await this.refresh()
        await this.getUser()
      } catch (error) {
        return
      }
      return
    },

    //login action
    async login(payload: LoginData) {
      try {
        // useApi() is a function that returns the public axios instance
        const { data } = await useApi().post(`/api/auth/login`, payload)
        this.accessToken = data.access_token
        await this.getUser()
        // Emit 'register' event with user ID after successful login and data load
        if (this.user.user?._id) {
          socket.emit('register', this.user.user._id.toString())
          console.log('User registered with ID:', this.user.user._id)
        }
        return data
      } catch (error: Error | any) {
        // Extract the error message sent by the backend
        if (error.response && error.response.data && error.response.data.message) {
          throw new Error(error.response.data.message) // Pass the backend message to the caller
        } else {
          throw new Error('An unexpected error occurred during login') // Fallback error message
        }
      }
    },

    async register(payload: RegisterData) {
      try {
        const { data } = await useApi().post(`/api/auth/register`, payload)
        return data
      } catch (error: Error | any) {
        // Extract the error message sent by the backend
        if (error.response && error.response.data && error.response.data.message) {
          throw new Error(error.response.data.message) // Pass the backend message to the caller
        } else {
          throw new Error('An unexpected error occurred during login') // Fallback error message
        }
      }
    },

    async getUser() {
      try {
        // Fetch the user data from the backend with the private axios instance
        const { data } = await useApiPrivate().get(`/api/auth/user`)
        // Dynamically assign the role document to the state
        this.user = data

        return data
      } catch (error: Error | any) {
        throw error.message
      }
    },

    async viewUser(userId: string) {
      try {
        const { data } = await useApiPrivate().get(`/api/auth/user/${userId}`)

        this.userView = {
          userView: data.user // Now data is directly the user object
        }
      } catch (error: Error | any) {
        throw error.message
      }
    },

    async logout() {
      try {
        const { data } = await useApiPrivate().post(`/api/auth/logout`)
        this.accessToken = ''
        this.user = {} as User
        return data
      } catch (error: Error | any) {
        throw error.message
      }
    },

    async refresh() {
      try {
        const { data } = await useApi().post(`/api/auth/refresh`)
        this.accessToken = data.access_token
        return data
      } catch (error: Error | any) {
        throw error.message
      }
    },
    async updateUser(userId: string, userData: FormData) {
      try {
        const response = await useApiPrivate().put(`/api/auth/update-profile/${userId}`, userData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })

        if (response.data) {
          // Ensure we're updating with the correct structure
          if (this.user?.user?._id === userId) {
            // Update current user state
            this.user = {
              user: {
                ...this.user.user,
                ...response.data
              }
            }
          }

          // Update user view state
          this.userView = {
            userView: {
              ...this.userView.userView,
              ...response.data
            }
          }
        }
        return response.data
      } catch (error) {
        console.error('Error updating user:', error)
        throw error
      }
    },
    // Add this action to your store
    async updatePassword(userId: string, payload: PasswordUpdateData) {
      try {
        const response = await useApiPrivate().put(`/api/auth/update-password/${userId}`, payload)
        return response.data
      } catch (error: any) {
        if (error.response?.data?.message) {
          throw new Error(error.response.data.message)
        }
        throw new Error('Failed to update password')
      }
    },

    async banUser(userId: string) {
      try {
        const { data } = await useApiPrivate().put(`/api/admin/banUser`, { userId } )
        return data
      } catch (error: Error | any) {
        // Extract the error message sent by the backend
        if (error.response && error.response.data && error.response.data.message) {
          throw new Error(error.response.data.message) // Pass the backend message to the caller
        } else {
          throw new Error('An unexpected error occurred during ') // Fallback error message
        }
      }
    },

    async loadAllUser() {
      try {
        const { data } = await useApiPrivate().get(`/api/admin/loadAllUser`)
        return data
      } catch (error: Error | any) {
        throw error.message
      }
    }
  }
})
