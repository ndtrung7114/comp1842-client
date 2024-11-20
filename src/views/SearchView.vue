<template>
    <div class="container py-4">
      <!-- Search Header -->
      <div class="mb-4">
        <div class="d-flex align-items-center gap-3 mb-3">
          <input 
            type="text" 
            class="form-control form-control-lg"
            v-model="searchQuery"
            placeholder="Search..."
            @input="handleSearch"
          />
          <select 
            v-model="searchType" 
            class="form-select form-select-lg"
            style="width: auto;"
            @change="handleSearch"
          >
            <option value="all">All</option>
            <option value="posts">Posts</option>
            <option value="users">Users</option>
          </select>
        
          <!-- Posts Sort Dropdown -->
        <div class="dropdown" v-if="searchType === 'all' || searchType === 'posts'">
          <button 
            class="btn btn-outline-primary dropdown-toggle" 
            type="button" 
            data-bs-toggle="dropdown" 
            aria-expanded="false"
          >
            <i class="fas fa-sort me-2"></i>
            Posts: {{ postSortLabel }}
          </button>
          <ul class="dropdown-menu">
            <li>
              <a 
                class="dropdown-item" 
                href="#"
                @click.prevent="changePostSort('newest')"
              >
                Newest First
              </a>
            </li>
            <li>
              <a 
                class="dropdown-item" 
                href="#"
                @click.prevent="changePostSort('oldest')"
              >
                Oldest First
              </a>
            </li>
          </ul>
        </div>

        <!-- Users Sort Dropdown -->
        <div class="dropdown" v-if="searchType === 'all' || searchType === 'users'">
      <button 
        class="btn btn-outline-primary dropdown-toggle" 
        type="button" 
        data-bs-toggle="dropdown" 
        aria-expanded="false"
      >
        <i class="fas fa-sort me-2"></i>
        Users: {{ userSortLabel }}
      </button>
      <ul class="dropdown-menu">
        <li>
          <a 
            class="dropdown-item d-flex justify-content-between align-items-center" 
            href="#"
            @click.prevent="changeUserSort('usernameAsc')"
          >
            Username
            <i class="fas fa-sort-up"></i>
          </a>
        </li>
        <li>
          <a 
            class="dropdown-item d-flex justify-content-between align-items-center" 
            href="#"
            @click.prevent="changeUserSort('usernameDesc')"
          >
            Username
            <i class="fas fa-sort-down"></i>
          </a>
        </li>
        <li>
          <a 
            class="dropdown-item d-flex justify-content-between align-items-center" 
            href="#"
            @click.prevent="changeUserSort('firstNameAsc')"
          >
            First Name
            <i class="fas fa-sort-up"></i>
          </a>
        </li>
        <li>
          <a 
            class="dropdown-item d-flex justify-content-between align-items-center" 
            href="#"
            @click.prevent="changeUserSort('firstNameDesc')"
          >
            First Name
            <i class="fas fa-sort-down"></i>
          </a>
        </li>
        <li>
          <a 
            class="dropdown-item d-flex justify-content-between align-items-center" 
            href="#"
            @click.prevent="changeUserSort('lastNameAsc')"
          >
            Last Name
            <i class="fas fa-sort-up"></i>
          </a>
        </li>
        <li>
          <a 
            class="dropdown-item d-flex justify-content-between align-items-center" 
            href="#"
            @click.prevent="changeUserSort('lastNameDesc')"
          >
            Last Name
            <i class="fas fa-sort-down"></i>
          </a>
        </li>
      </ul>
    </div>
        </div>
        
        <div class="text-muted" v-if="searchStore.query">
          Results for "{{ searchStore.query }}"
        </div>
      </div>
  
      <!-- Loading State -->
      <div v-if="searchStore.isLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
  
      <!-- Error State -->
      <div v-else-if="searchStore.error" class="alert alert-danger">
        {{ searchStore.error }}
      </div>
  
      <!-- No Results -->
      <div 
        v-else-if="!searchStore.hasResults && searchStore.query" 
        class="text-center py-5"
      >
        No results found for "{{ searchStore.query }}"
      </div>
  
      <!-- Results -->
      <div v-else class="row g-4">
        <!-- Posts Section -->
        <div v-if="searchStore.postResults.length > 0" class="col-12 mb-4">
          <h2 class="h4 mb-3">Posts</h2>
          <div class="card-list gap-3">
            <div 
              v-for="post in searchStore.postResults" 
              :key="post._id"
              class="card"
            >
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <h3 class="h5 card-title mb-0">
                    <router-link 
                      :to="{ name: 'post-detail', params: { id: post._id }}"
                      class="text-decoration-none"
                    >
                      {{ post.title }}
                    </router-link>
                  </h3>
                  <small class="text-muted">{{ formatDate(post.createdAt) }}</small>
                </div>
                
                <p class="card-text text-muted">{{ truncateText(post.body, 200) }}</p>
                
                <div class="d-flex align-items-center">
                  <img 
                    :src="post.author.profile.avatar || '/default-avatar.png'" 
                    class="rounded-circle me-2"
                    width="24" 
                    height="24" 
                    alt="Avatar"
                  />
                  <router-link 
                    :to="{ name: 'user', params: { id: post.author._id }}"
                    class="text-decoration-none"
                  >
                    {{ post.author.username }}
                  </router-link>
                  <div class="ms-auto">
                    <span class="me-3">
                      <i class="far fa-heart"></i> {{ post.likes }}
                    </span>
                    <span>
                      <i class="far fa-comment"></i> {{ post.comments.length }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Users Section -->
        <div v-if="searchStore.userResults.length > 0" class="col-12">
          <h2 class="h4 mb-3">Users</h2>
          <div class="row g-3">
            <div 
              v-for="user in searchStore.userResults" 
              :key="user._id"
              class="col-md-6 col-lg-4"
            >
           
              <div class="card h-100">
                <div class="card-body">
                  <div class="d-flex align-items-center mb-3">
                    <img 
                      :src="user.profile.avatar || '/default-avatar.png'" 
                      class="rounded-circle me-3"
                      width="48" 
                      height="48" 
                      alt="Avatar"
                    />
                    <div>
                      <h3 class="h6 mb-1">
                        <router-link 
                          :to="{ name: 'user', params: { id: user._id }}"
                          class="text-decoration-none"
                        >
                          {{ user.username }}
                        </router-link>
                      </h3>
                      <div class="text-muted small">
                        {{ user.first_name }} {{ user.last_name }}
                      </div>
                    </div>
                  </div>
                  
                  <div class="d-flex justify-content-around text-center">
                    <div>
                      <div class="fw-bold">{{ user.posts.length }}</div>
                      <small class="text-muted">Posts</small>
                    </div>
                    <div>
                      <div class="fw-bold">{{ user.followers.length }}</div>
                      <small class="text-muted">Followers</small>
                    </div>
                    <div>
                      <div class="fw-bold">{{ user.following.length }}</div>
                      <small class="text-muted">Following</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, watch, computed } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useDebounce } from '@vueuse/core'
  import { useSearchStore } from '@/stores/search'
  
 
  const route = useRoute()
  const router = useRouter()
  const searchStore = useSearchStore()
  
  const searchQuery = ref('')
  const searchType = ref<'all' | 'posts' | 'users'>('all')
 
  const debouncedSearch = useDebounce(searchQuery, 300)


// Post sort label computation
const postSortLabel = computed(() => 
  searchStore.postSortOption === 'newest' ? 'Newest First' : 'Oldest First'
)

// User sort label computation
const userSortLabel = computed(() => {
  switch (searchStore.userSortOption) {
    case 'usernameAsc': return 'Username (A-Z)'
    case 'usernameDesc': return 'Username (Z-A)'
    case 'firstNameAsc': return 'First Name (A-Z)'
    case 'firstNameDesc': return 'First Name (Z-A)'
    case 'lastNameAsc': return 'Last Name (A-Z)'
    case 'lastNameDesc': return 'Last Name (Z-A)'
    default: return 'Username (A-Z)'
  }
})

// Change post sort option
const changePostSort = (option: 'newest' | 'oldest') => {
  searchStore.setPostSortOption(option)
  
  // Update URL with sort option
  router.push({
    query: {
      ...route.query,
      postSort: option
    }
  })
}

// Change user sort option
const changeUserSort = (option: 'usernameAsc' | 'usernameDesc' | 'firstNameAsc' | 'firstNameDesc' | 'lastNameAsc' | 'lastNameDesc') => {
  searchStore.setUserSortOption(option)
  
  // Update URL with sort option
  router.push({
    query: {
      ...route.query,
      userSort: option
    }
  })
}
  // Initialize search from URL params
  onMounted(() => {
    const query = route.query.q as string
    const filter = route.query.filter as 'all' | 'posts' | 'users'
    const postSort = route.query.postSort as 'newest' | 'oldest'
   const userSort = route.query.userSort as 'usernameAsc' | 'usernameDesc' | 'firstNameAsc' | 'firstNameDesc' | 'lastNameAsc' | 'lastNameDesc'
    
    // Set sort options from URL if provided
  if (postSort) searchStore.setPostSortOption(postSort)
  if (userSort) searchStore.setUserSortOption(userSort)
  
    if (query) {
      searchQuery.value = query
      searchType.value = filter || 'all'

      searchStore.search(query, filter)
    }
  })
  
  // Handle search
  const handleSearch = async () => {
    if (searchQuery.value.trim()) {
      // Update URL
      router.push({
        name: 'search',
        query: {
          q: searchQuery.value,
          filter: searchType.value,

        }
      })
      
      await searchStore.search(searchQuery.value, searchType.value)
      console.log('User Results after search:', searchStore.userResults)
    }
  }
  
  // Utility functions
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
  
  const truncateText = (text: string, length: number) => {
    if (text.length <= length) return text
    return text.slice(0, length) + '...'
  }
  
  // Watch for query changes
  watch(debouncedSearch, () => {
    handleSearch()
  })

 
  </script>
  
  <style scoped>
  .card-list {
    display: flex;
    flex-direction: column;
  }
  </style>