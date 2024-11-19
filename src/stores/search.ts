import { defineStore } from 'pinia'
import { useApi } from '../composables/useApi'

export interface PostResult {
  _id: string
  title: string
  body: string
  author: {
    _id: string
    username: string
    first_name: string
    last_name: string
    profile: {
      avatar: string
    }
  }
  imageUrls: string[]
  likes: number
  likedBy: string[]
  comments: string[]
  createdAt: string
  updatedAt: string
}

export interface UserResult {
  _id: string
  username: string
  email: string
  first_name: string
  last_name: string
  profile: {
    facebook: string
    avatar: string
  }
  followers: string[]
  following: string[]
  posts: string[]
  status: string
}

export interface SearchState {
  query: string
  filter: 'all' | 'posts' | 'users'
  results: (PostResult | UserResult)[]
  isLoading: boolean
  error: string | null
  postSortOption: 'newest' | 'oldest'
  userSortOption: 'usernameAsc' | 'usernameDesc' | 'firstNameAsc' | 'firstNameDesc' | 'lastNameAsc' | 'lastNameDesc'
}

export const useSearchStore = defineStore('search', {
  state: (): SearchState => ({
    query: '',
    filter: 'all',
    results: [],
    isLoading: false,
    error: null,
     postSortOption: 'newest',
    userSortOption: 'usernameAsc'
  }),

  getters: {
    postResults(): PostResult[] {
      const posts = this.results.filter((result): result is PostResult => 'title' in result)
      return posts.sort((a, b) => {
        const dateA = new Date(a.createdAt)
        const dateB = new Date(b.createdAt)
        return this.postSortOption === 'newest' 
          ? dateB.getTime() - dateA.getTime() 
          : dateA.getTime() - dateB.getTime()
      })
    },
    
    userResults(): UserResult[] {
      const users = this.results.filter((result): result is UserResult => 'username' in result)
      return users.sort((a, b) => {
        let compareResult: number;
        switch (this.userSortOption) {
          case 'usernameAsc':
            compareResult = a.username.localeCompare(b.username)
            break
          case 'usernameDesc':
            compareResult = b.username.localeCompare(a.username)
            break
          case 'firstNameAsc':
            compareResult = a.first_name.localeCompare(b.first_name)
            break
          case 'firstNameDesc':
            compareResult = b.first_name.localeCompare(a.first_name)
            break
          case 'lastNameAsc':
            compareResult = a.last_name.localeCompare(b.last_name)
            break
          case 'lastNameDesc':
            compareResult = b.last_name.localeCompare(a.last_name)
            break
          default:
            compareResult = 0
        }
        return compareResult
      })
    },
    

    hasResults: (state) => state.results.length > 0
  },

  actions: {
    async search(query: string, filter: 'all' | 'posts' | 'users' = 'all') {
      this.isLoading = true
      this.error = null
      this.query = query
      this.filter = filter

      try {
        const params = new URLSearchParams({
          q: query,
          filter: filter
        })

        const { data } = await useApi().get(`/api/search?${params}`)
        this.results = data
       
        // Log the results to inspect
    console.log('Search results:', this.results)
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Search failed'
        this.results = []
      } finally {
        this.isLoading = false
      }
    },
    setPostSortOption(option: 'newest' | 'oldest') {
      this.postSortOption = option
    },

    setUserSortOption(option: 'usernameAsc' | 'usernameDesc' | 'firstNameAsc' | 'firstNameDesc' | 'lastNameAsc' | 'lastNameDesc') {
      this.userSortOption = option
    },

    clearSearch() {
      this.query = ''
      this.results = []
      this.error = null
      this.postSortOption = 'newest'
      this.userSortOption = 'usernameAsc'
    }
  }
})