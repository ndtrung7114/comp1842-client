<template>
  <div class="container-fluid mt-4">
    <div class="row g-4">
      <!-- Left Sidebar -->
      <div class="col-md-3 left-sidebar">
        <div class="sidebar-menu bg-white p-3 rounded-lg shadow-sm border">
          <ul class="list-group list-group-flush">
            <li class="list-group-item d-flex align-items-center sidebar-item">
              <i class="fas fa-user-friends me-3 text-primary"></i>
              <span class="fw-semibold">Friend Requests</span>
            </li>
            <li class="list-group-item d-flex align-items-center sidebar-item">
              <i class="fas fa-users me-3 text-success"></i>
              <span class="fw-semibold">Groups</span>
            </li>
            <li class="list-group-item d-flex align-items-center sidebar-item">
              <i class="fas fa-store me-3 text-warning"></i>
              <span class="fw-semibold">Marketplace</span>
            </li>
            <li class="list-group-item d-flex align-items-center sidebar-item">
              <i class="fas fa-calendar-alt me-3 text-danger"></i>
              <span class="fw-semibold">Events</span>
            </li>
            <router-link
              v-if="user.user.role == 'admin'"
              :to="{ name: 'allUser' }"
              class="text-decoration-none"
            >
              <li class="list-group-item d-flex align-items-center sidebar-item">
                <i class="fas fa-users-cog me-3 text-info"></i>
                <span class="fw-semibold">Users</span>
              </li>
            </router-link>
          </ul>
        </div>
      </div>

      <!-- Middle Section -->
      <div class="col-md-6 middle-section">
        <!-- Create Post Card -->
        <div class="card create-post-card mb-4 shadow-sm border-0">
          <div class="card-body p-4">
            <router-link :to="{ name: 'create-post' }" class="text-decoration-none">
              <button class="btn btn-primary w-100 create-post-btn">
                <i class="fas fa-plus-circle me-2"></i>Create New Post
              </button>
            </router-link>
          </div>
        </div>

        <!-- Loading and Error States -->
        <div v-if="loading" class="text-center my-4">
          <div class="spinner-border text-primary spinner-lg" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
        <div v-if="error" class="alert alert-danger fade show">
          <i class="fas fa-exclamation-circle me-2"></i>
          {{ error }}
        </div>

        <!-- Posts -->
        <div v-for="post in posts" :key="post.id" class="card post-card mb-4 shadow-sm border-0">
          <div class="card-body p-4">
            <!-- Author Header -->
            <div class="d-flex align-items-center mb-3">
              <div class="avatar-container me-3">
                <div class="avatar">
                  <img
                    v-if="post.author?.profile?.avatar"
                    :src="BASE_URL + post.author.profile.avatar"
                    :alt="post.author.username"
                    class="avatar-img"
                  />
                  <i v-else class="fas fa-user-circle"></i>
                </div>
              </div>
              <div>
                <router-link
                  :to="{ name: 'user', params: { id: post.authorId } }"
                  v-if="post.authorId"
                  class="text-decoration-none"
                >
                  <h5 class="mb-0 author-name">{{ post.username }}</h5>
                </router-link>
                <small class="text-muted">{{ post.title }}</small>
              </div>
            </div>

            <!-- Image Gallery -->
            <div v-if="post.imageUrls && post.imageUrls.length > 0" class="image-gallery mb-3">
              <div
                v-for="(imageUrl, index) in post.imageUrls.slice(0, 3)"
                :key="index"
                class="image-container"
              >
                <img
                  :src="BASE_URL + imageUrl"
                  alt="Post Image"
                  class="gallery-image"
                  @click="viewImage(imageUrl, post)"
                />
              </div>
              <div
                v-if="post.imageUrls.length >= 4"
                class="image-container overlay-container"
                @click="viewImage(post.imageUrls[3], post)"
              >
                <img :src="BASE_URL + post.imageUrls[3]" alt="Post Image" class="gallery-image" />
                <div v-if="post.imageUrls.length > 4" class="grey-overlay">
                  <span class="overlay-text">+{{ post.imageUrls.length - 4 }}</span>
                </div>
              </div>
            </div>

            <!-- Interaction Section -->
            <div class="post-interactions">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <div class="likes-count">
                  <i class="fas fa-thumbs-up text-primary me-1"></i>
                  <span>{{ post.likes }} likes</span>
                </div>
                <router-link
                  v-if="post.id"
                  :to="{ name: 'post-detail', params: { id: post.id } }"
                  class="comments-count text-decoration-none"
                >
                  <span>{{ post.commentsCount }} comments</span>
                </router-link>
              </div>

              <hr class="my-3" />

              <!-- Action Buttons -->
              <div class="action-buttons">
                <button
                  :class="['btn action-btn', isPostLiked(post) ? 'btn-primary' : 'btn-light']"
                  @click="toggleLike(post)"
                >
                  <i class="fas fa-thumbs-up me-2"></i>Like
                </button>
                <router-link
                  v-if="post.id"
                  :to="{ name: 'post-detail', params: { id: post.id } }"
                  class="btn btn-light action-btn"
                >
                  <i class="fas fa-comment me-2"></i>Comment
                </router-link>
                <button class="btn btn-light action-btn">
                  <i class="fas fa-share me-2"></i>Share
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Sidebar -->
      <div class="col-md-3 right-sidebar">
        <div class="sidebar-content bg-white p-3 rounded-lg shadow-sm border">
          <ul class="list-group list-group-flush">
            <li class="list-group-item d-flex align-items-center sidebar-item">
              <i class="fas fa-chart-line me-3 text-info"></i>
              <span class="fw-semibold">Trending</span>
            </li>
            <li class="list-group-item d-flex align-items-center sidebar-item">
              <i class="fas fa-ad me-3 text-success"></i>
              <span class="fw-semibold">Sponsored</span>
            </li>
            <li class="list-group-item d-flex align-items-center sidebar-item">
              <i class="fas fa-thumbs-up me-3 text-primary"></i>
              <span class="fw-semibold">Pages You Like</span>
            </li>
            <li class="list-group-item d-flex align-items-center sidebar-item">
              <i class="fas fa-bullhorn me-3 text-warning"></i>
              <span class="fw-semibold">Ads</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Image Modal -->
    <div
      v-if="isModalVisible"
      class="modal-overlay"
      @click="closeModal"
      @keydown="handleKeyNavigation"
    >
      <div class="modal-content" @click.stop>
        <div class="modal-image-container">
          <button
            v-if="currentPost?.imageUrls && currentPost.imageUrls.length > 1"
            class="nav-btn prev-btn"
            @click.stop="navigateImage('prev')"
            :disabled="currentImageIndex === 0"
          >
            <i class="fas fa-chevron-left"></i>
          </button>

          <img
            v-if="selectedImageUrl"
            :src="selectedImageUrl"
            alt="Selected Image"
            class="modal-image"
            @click.stop
          />

          <button
            v-if="currentPost?.imageUrls && currentPost.imageUrls.length > 1"
            class="nav-btn next-btn"
            @click.stop="navigateImage('next')"
            :disabled="currentImageIndex === currentPost.imageUrls.length - 1"
          >
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>

        <div
          class="image-counter"
          v-if="currentPost?.imageUrls && currentPost.imageUrls.length > 1"
        >
          {{ currentImageIndex + 1 }} / {{ currentPost.imageUrls.length }}
        </div>

        <button class="close-btn" @click="closeModal">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>

    <!-- Notification Component -->
    <Notification
      v-if="notification"
      :message="notification"
      :notificationType="notificationType"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, watch } from 'vue'
import { usePostsStore } from '../../stores/posts'
import { useAuthStore } from '../../stores/auth'
import { useNotificationsStore } from '@/stores/notifications'
import Notification from '../../components/Notification.vue' // Import your Notification component

import type { Post } from '../../stores/posts'

export default defineComponent({
  components: {
    Notification
  },
  setup() {
    const BASE_URL = import.meta.env.VITE_API_URI as string
    const postsStore = usePostsStore()
    const userStore = useAuthStore()
    const notificationsStore = useNotificationsStore()
    const userId = userStore.userDetail.user._id
    const notification = ref<string | null>(null)
    const notificationType = ref<string>('info') // Default notification type

    // Changed selectedImageUrl to be `string | undefined`
    const selectedImageUrl = ref<string | undefined>(undefined)
    const isModalVisible = ref<boolean>(false)

    const currentPost = ref<Post | null>(null)
    const currentImageIndex = ref<number>(0)

    // Watch for changes in notifications
    watch(
      () => notificationsStore.notifications,
      (newNotifications) => {
        if (newNotifications.length > 0) {
          const latestNotification = newNotifications[newNotifications.length - 1]
          notification.value = latestNotification.message
          notificationType.value = latestNotification.type

          // Clear notification after 3 seconds
          setTimeout(() => {
            notification.value = null
          }, 2000)
        }
      },
      { deep: true }
    )

    postsStore.getAllPost()

    const isPostLiked = (post: Post) => {
      return post.likedBy?.includes(userStore.user.user._id) || false
    }

    const toggleLike = async (post: Post) => {
      if (isPostLiked(post)) {
        const result = await postsStore.unlikePost(post.id)
        if (result) {
          post.likedBy = post.likedBy?.filter((id) => id !== userStore.user.user._id) || []
        }
      } else {
        const result = await postsStore.likePost(post.id)
        if (result) {
          post.likedBy = [...(post.likedBy || []), userStore.user.user._id]
        }
      }
    }

    const viewImage = (imageUrl: string, post: Post) => {
      if (!post.imageUrls) return

      currentPost.value = post
      const index = post.imageUrls.findIndex((url) => url === imageUrl)
      currentImageIndex.value = index !== -1 ? index : 0
      selectedImageUrl.value = BASE_URL + imageUrl
      isModalVisible.value = true

      // Add event listener for keyboard navigation
      window.addEventListener('keydown', handleKeyNavigation)
    }

    const navigateImage = (direction: 'prev' | 'next') => {
      if (!currentPost.value?.imageUrls) return

      const maxIndex = currentPost.value.imageUrls.length - 1

      if (direction === 'prev' && currentImageIndex.value > 0) {
        currentImageIndex.value--
      } else if (direction === 'next' && currentImageIndex.value < maxIndex) {
        currentImageIndex.value++
      }

      selectedImageUrl.value = BASE_URL + currentPost.value.imageUrls[currentImageIndex.value]
    }

    const handleKeyNavigation = (event: KeyboardEvent) => {
      if (!isModalVisible.value) return

      switch (event.key) {
        case 'ArrowLeft':
          navigateImage('prev')
          break
        case 'ArrowRight':
          navigateImage('next')
          break
        case 'Escape':
          closeModal()
          break
      }
    }

    const closeModal = () => {
      isModalVisible.value = false
      selectedImageUrl.value = undefined
      currentPost.value = null
      currentImageIndex.value = 0

      // Remove event listener when modal is closed
      window.removeEventListener('keydown', handleKeyNavigation)
    }

    return {
      posts: computed(() => postsStore.allPosts),
      user: computed(() => userStore.user),
      loading: computed(() => postsStore.isLoading),
      error: computed(() => postsStore.getError),
      BASE_URL,
      toggleLike,
      isPostLiked,
      notification,
      notificationType,
      userId,
      viewImage,
      closeModal,
      isModalVisible,
      selectedImageUrl,
      currentPost,
      currentImageIndex,
      handleKeyNavigation,
      navigateImage
    }
  }
})
</script>

<style scoped>
.left-sidebar,
.right-sidebar {
  background-color: #f8f9fa;
}

:root {
  --primary-color: #1877f2;
  --secondary-color: #f0f2f5;
  --text-primary: #1c1e21;
  --text-secondary: #65676b;
}

.container-fluid {
  background-color: var(--secondary-color);
  min-height: 100vh;
}

.sidebar-item {
  border: none;
  padding: 12px;
  transition: all 0.2s ease;
  border-radius: 8px;
  margin-bottom: 4px;
}

.sidebar-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
  transform: translateX(5px);
}

.avatar-container {
  width: 40px;
  height: 40px;
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #e4e6eb;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar i {
  font-size: 1.5rem;
  color: #65676b;
}

.author-name {
  color: var(--text-primary);
  font-weight: 600;
}
.middle-section {
  max-height: calc(100vh - 60px);
  overflow-y: scroll;
  padding: 15px;
}

.middle-section::-webkit-scrollbar {
  display: none;
}

.middle-section {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.no-underline {
  text-decoration: none;
}

.card {
  border-radius: 10px;
}

.create-post {
  text-align: center;
}

.buttons-section {
  display: flex;
  gap: 10px;
}

.alert {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
}

.image-gallery {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* Two columns */
  gap: 10px;
}

.image-container {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.image-container img:hover {
  transform: scale(1.1);
}

.overlay-container {
  position: relative;
  cursor: pointer;
}

.grey-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
}

.overlay-text {
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
}

.more-images {
  font-weight: bold;
  color: #007bff;
  margin-top: 5px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  transition: opacity 0.3s ease;
}

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(255, 255, 255, 0.3);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
  color: white;
  z-index: 1;
}

.nav-btn:hover {
  background-color: rgba(255, 255, 255, 0.5);
}

.nav-btn:disabled {
  background-color: rgba(255, 255, 255, 0.1);
  cursor: not-allowed;
}

.prev-btn {
  left: 20px;
}

.next-btn {
  right: 20px;
}

.image-counter {
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  font-size: 14px;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 5px 10px;
  border-radius: 12px;
}

/* Post Interactions */
.post-interactions {
  padding-top: 12px;
}

.action-buttons {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.action-btn {
  flex: 1;
  padding: 8px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background-color: #f0f2f5;
  transform: translateY(-2px);
}

.modal-content {
  position: relative;
  width: 90vw;
  height: 90vh;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: transform 0.3s ease;
}

.modal-image-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-image {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.close-btn {
  position: absolute;
  top: -40px;
  right: -40px;
  background-color: transparent;
  color: white;
  border: none;
  font-size: 32px;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: transform 0.2s ease;
}

.close-btn:hover {
  transform: scale(1.2);
}
</style>
