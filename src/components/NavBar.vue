<template>
  <nav class="navbar navbar-expand-lg custom-navbar shadow-sm sticky-top">
    <div class="container-fluid px-4">
      <router-link class="navbar-brand fw-bold text-primary" :to="{ name: 'home' }">
        <i class=""></i>
        GreenwichVN
      </router-link>
      
      <button
        class="navbar-toggler border-0"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#appNavbar"
        aria-controls="appNavbar"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="appNavbar">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <router-link :to="{ name: 'home' }" class="nav-link hover-underline" aria-current="page">
              <i class="fas fa-home me-1"></i> Home
            </router-link>
          </li>
          <li class="nav-item">
            <router-link :to="{ name: 'posts' }" class="nav-link hover-underline" aria-current="page">
              <i class="fas fa-newspaper me-1"></i> Posts
            </router-link>
          </li>
        </ul>

        <!-- Search Form -->
        <form class="d-flex me-4 search-container position-relative" @submit.prevent="handleSearch" v-if="isAuthenticated && user.user">
          <div class="input-group">
            <input
              type="search"
              class="form-control search-input"
              placeholder="Search..."
              v-model="searchQuery"
              @focus="showSuggestions = true"
            />
            <button class="btn btn-primary" type="submit">
              <i class="fas fa-search"></i>
            </button>
          </div>

          <!-- Quick Suggestions Dropdown -->
          <div
            v-if="showSuggestions && searchQuery.trim() && searchResults.length > 0"
            class="search-suggestions"
          >
            <div class="list-group">
              <router-link
                v-for="result in searchResults.slice(0, 5)"
                :key="result._id"
                :to="getResultLink(result)"
                class="list-group-item list-group-item-action border-0 py-2"
                @click="closeSuggestions"
              >
                <!-- Post Result -->
                <template v-if="'title' in result">
                  <div class="d-flex align-items-center">
                    <div class="search-icon-wrapper me-2">
                      <i class="far fa-file-alt"></i>
                    </div>
                    <div>
                      <div class="fw-medium">{{ result.title }}</div>
                      <small class="text-muted">by {{ result.author.username }}</small>
                    </div>
                  </div>
                </template>

                <!-- User Result -->
                <template v-else>
                  <div class="d-flex align-items-center">
                    <img
                      :src=" result.profile.avatar || '/default-avatar.png'"
                      class="rounded-circle me-2 search-avatar"
                      width="32"
                      height="32"
                      alt="Avatar"
                    />
                    <div>
                      <div class="fw-medium">{{ result.username }}</div>
                      <small class="text-muted">{{ result.first_name }} {{ result.last_name }}</small>
                    </div>
                  </div>
                </template>
              </router-link>

              <router-link
                :to="{
                  name: 'search',
                  query: { q: searchQuery, filter: 'all' }
                }"
                class="list-group-item list-group-item-action text-center text-primary border-0 view-all"
                @click="closeSuggestions"
              >
                View all results
              </router-link>
            </div>
          </div>
        </form>

        <!-- Action Icons -->
        <div class="d-flex align-items-center">
          <!-- Notifications -->
          <div class="nav-item dropdown me-3" v-if="isAuthenticated && user.user">
            <a
              class="nav-link position-relative notification-icon"
              href="#"
              id="notificationDropdown"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              @click="openNotifications"
              title="Notifications"
            >
              <i class="fa-solid fa-bell"></i>
              <span v-if="unreadNotificationsCount && isOutsideMessagesPage" 
                    class="notification-badge">
                {{ unreadNotificationsCount }}
              </span>
            </a>
            <ul class="dropdown-menu dropdown-menu-end notification-dropdown py-0" aria-labelledby="notificationDropdown">
              <li class="dropdown-header border-bottom py-2 px-3 bg-light">
                <span class="fw-bold">Notifications</span>
              </li>
              <li v-if="notificationsStore.notificationForUser.length === 0" class="dropdown-item py-3 text-center text-muted">
                No notifications
              </li>
              <li v-for="notification in notificationsStore.notificationForUser"
                  :key="notification._id"
                  class="notification-item border-bottom">
                <div class="d-flex px-3 py-2">
                  <div class="notification-content">
                    <p class="mb-1">{{ notification.message }}</p>
                    <small class="text-muted">{{ notification.created_at.toLocaleString() }}</small>
                  </div>
                </div>
              </li>
            </ul>
          </div>

          <!-- Messages -->
          <div class="nav-item me-3" v-if="isAuthenticated && user.user">
            <router-link :to="{ name: 'messages' }" class="nav-link position-relative message-icon" title="Messages">
              <i class="fa-brands fa-facebook-messenger"></i>
              <span v-if="unreadConversationsCount && isOutsideMessagesPage" 
                    class="message-badge">
                {{ unreadConversationsCount }}
              </span>
            </router-link>
          </div>

          <!-- User Role Badge -->
          <div v-if="isAuthenticated && user.user && user.user.role == 'admin'" class="user-role me-3">
            <span class="badge bg-primary-subtle text-primary">{{ user.user.role }}</span>
          </div>

          <!-- User Profile -->
          <ul class="navbar-nav">
            <li v-if="isAuthenticated && user.user" class="nav-item dropdown">
              <a
                class="nav-link dropdown-toggle d-flex align-items-center"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <img
                  :src="user.user.profile?.avatar || '/default-avatar.png'"
                  class="rounded-circle me-2"
                  width="32"
                  height="32"
                  alt="Profile"
                />
                <!-- <span class="username">{{ user.user.username }}</span> -->
              </a>
              <ul class="dropdown-menu dropdown-menu-end profile-dropdown">
                <li>
                  <router-link
                    :to="{ name: 'user', params: { id: user.user._id } }"
                    class="dropdown-item"
                  >
                    <i class="fas fa-user me-2"></i> Profile
                  </router-link>
                </li>
                <li><hr class="dropdown-divider" /></li>
                <li>
                  <button @click="logout" class="dropdown-item text-danger">
                    <i class="fas fa-sign-out-alt me-2"></i> Logout
                  </button>
                </li>
              </ul>
            </li>
            <template v-else>
              <li class="nav-item">
                <router-link :to="{ name: 'login' }" class="nav-link btn btn-outline-primary me-2">
                  Login
                </router-link>
              </li>
              <li class="nav-item">
                <router-link :to="{ name: 'register' }" class="nav-link btn btn-primary ">
                  Register
                </router-link>
              </li>
            </template>
          </ul>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth'
import { useNotificationsStore } from '@/stores/notifications'
import { useMessageStore } from '@/stores/message'
import { computed, onMounted, ref, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useDebounce } from '@vueuse/core'
import { useSearchStore } from '@/stores/search'




const messagesStore = useMessageStore()
const authStore = useAuthStore()
const notificationsStore = useNotificationsStore()
const searchStore = useSearchStore()
const router = useRouter()
const route = useRoute()

const searchQuery = ref('')
const showSuggestions = ref(false)
const debouncedSearch = useDebounce(searchQuery, 300)

const searchResults = computed(() => searchStore.results)

// Handle main search submission
const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({
      name: 'search',
      query: {
        q: searchQuery.value,
        filter: 'all'
      }
    })
    
    closeSuggestions()
  }
}

// Get link for search result
const getResultLink = (result: any) => {
  if ('title' in result) {
    return { name: 'post-detail', params: { id: result._id } }
  }
  return { name: 'user', params: { id: result._id } }
}

// Close suggestions dropdown
const closeSuggestions = () => {
  showSuggestions.value = false
  searchQuery.value = ''
}

// Handle click outside
const handleClickOutside = (event: MouseEvent) => {
  const searchContainer = document.querySelector('.search-container')
  if (searchContainer && !searchContainer.contains(event.target as Node)) {
    closeSuggestions()
  }
}
// Setup and cleanup
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

// Cleanup
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Watch for query changes to update suggestions
watch(debouncedSearch, async () => {
  if (searchQuery.value.trim()) {
    await searchStore.search(searchQuery.value, 'all')
  }
})
const user = computed(() => {
  return authStore.user
})

const isAuthenticated = computed(() => {
  return authStore.isAuthenticated
})

// Fetch notifications when the user logs in
onMounted(async () => {
  if (authStore.isAuthenticated) {
    await notificationsStore.getNotificationForUser()
  }
})

const unreadNotificationsCount = computed(() => notificationsStore.unreadNotificationsCount)

async function openNotifications() {
  if (authStore.isAuthenticated) {
    await notificationsStore.markAllAsReadForUser() // Mark all notifications as read in the API
    await notificationsStore.getNotificationForUser() // Refresh notifications to update unread count
  }
}

// Check if the user is outside the messages page
const isOutsideMessagesPage = computed(() => route.name !== 'messages')

// Computed property for unread conversations count from the store
const unreadConversationsCount = computed(() => messagesStore.unreadConversationsCount)

// Fetch all messages initially
messagesStore.getAllMessages()

async function logout() {
  await authStore
    .logout()
    .then((res) => {
      router.replace({ name: 'home' })
    })
    .catch((err) => {
      console.log(err.message)
    })
}
</script>

<style src="../assets/style/component/NavBar.css"></style>
