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
                    :src=" post.author.profile.avatar"
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
                  :src="imageUrl"
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
                <img :src="post.imageUrls[3]" alt="Post Image" class="gallery-image" />
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
      selectedImageUrl.value =  imageUrl
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

      selectedImageUrl.value = currentPost.value.imageUrls[currentImageIndex.value]
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
@import '../../assets/style/post/PostView.css';
</style>
