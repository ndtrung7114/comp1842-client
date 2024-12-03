<template>
  <div class="container-fluid py-4">
    <!-- Header Section -->
    <div class="card bg-primary text-white mb-4 border-0">
      <div class="card-body d-flex justify-content-between align-items-center">
        <div>
          <h1 class="h2 mb-2">User Management</h1>
          <p class="mb-0">Manage and monitor all registered users</p>
        </div>
        <button class="btn btn-outline-light" @click="loadUsers">
          <i class="fas fa-sync-alt"></i> Refresh
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="row mb-4">
      <div class="col-md-4">
        <div class="card mb-3 border-start border-primary border-4">
          <div class="card-body">
            <h4 class="mb-0">{{ filteredUsers.length }}</h4>
            <div class="text-muted small">Total Users</div>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card mb-3 border-start border-success border-4">
          <div class="card-body">
            <h4 class="mb-0">{{ filteredUsers.filter((u: User['user']) => !u.isBan).length }}</h4>
            <div class="text-muted small">Active Users</div>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card mb-3 border-start border-danger border-4">
          <div class="card-body">
            <h4 class="mb-0">{{ filteredUsers.filter((u: User['user']) => u.isBan).length }}</h4>
            <div class="text-muted small">Banned Users</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Search and Filter Section -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row">
          <div class="col-md-8 mb-3 mb-md-0">
            <input
              v-model="searchQuery"
              type="text"
              class="form-control"
              placeholder="Search users..."
            />
          </div>
          <div class="col-md-4">
            <select v-model="roleFilter" class="form-select">
              <option value="">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Users Table -->
    <div class="card shadow-sm">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover align-middle">
            <thead>
              <tr>
                <th scope="col">User</th>
                <th scope="col">Email</th>
                <th scope="col">Role</th>
                <th scope="col">Status</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in filteredUsers" :key="user._id">
                <td>
                  <div class="d-flex align-items-center">
                    <img
                      :src="getAvatarUrl(user.profile?.avatar)"
                      :alt="user.username"
                      class="rounded-circle me-3"
                      width="48"
                      height="48"
                    />
                    <div>
                      <div class="fw-bold">{{ user.full_name || user.username }}</div>
                      <div class="text-muted small">@{{ user.username }}</div>
                    </div>
                  </div>
                </td>
                <td>{{ user.email }}</td>
                <td>
                  <span
                    class="badge rounded-pill"
                    :class="user.role === 'admin' ? 'bg-purple' : 'bg-success'"
                  >
                    {{ user.role }}
                  </span>
                </td>
                <td>
                  <span class="badge rounded-pill" :class="user.isBan ? 'bg-danger' : 'bg-success'">
                    {{ user.isBan ? 'Banned' : 'Active' }}
                  </span>
                </td>
                <td>
                  <div class="btn-group btn-group-sm">
                    <button
                      @click="handleBanUser(user._id)"
                      class="btn"
                      :class="user.isBan ? 'btn-outline-secondary' : 'btn-outline-danger'"
                      :disabled="user.role === 'admin'"
                    >
                      {{ user.isBan ? 'Unban' : 'Ban' }}
                    </button>
                    <button @click="viewUserProfile(user._id)" class="btn btn-outline-primary ms-2">
                      View Profile
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Error Alert -->
    <div v-if="error" class="alert alert-danger alert-dismissible fade show mt-4" role="alert">
      {{ error }}
      <button type="button" class="btn-close" @click="error = ''" aria-label="Close"></button>
    </div>
    
  </div>
  <Notification
      v-if="notification"
      :message="notification"
      :notificationType="notificationType"
    />
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useRouter } from 'vue-router'
import type { User } from '../../stores/auth'
import { useNotificationsStore } from '@/stores/notifications'
import Notification from '../../components/Notification.vue'


export default defineComponent({
  name: 'AllUserView',
  components: {
    Notification
  },
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()
    const users = ref<User['user'][]>([])
    const loading = ref(false)
    const error = ref('')
    const searchQuery = ref('')
    const roleFilter = ref('')
    const notificationsStore = useNotificationsStore()
    const notification = ref<string | null>(null)
    const notificationType = ref<string>('info') // Default notification type

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

    const getAvatarUrl = (avatarPath: string | undefined) => {
      if (!avatarPath) return '/default-avatar.png';
      // Remove leading slash if it exists to avoid double slashes
      const cleanPath = avatarPath.startsWith('/') ? avatarPath.slice(1) : avatarPath;
      return `${cleanPath}`;
    };

    const loadUsers = async () => {
      try {
        loading.value = true
        const response = await authStore.loadAllUser()
        users.value = response
      } catch (err: any) {
        error.value = err;
      } finally {
        loading.value = false
      }
    }

    const handleBanUser = async (userId: string) => {
      try {
        console.log(userId)
        await authStore.banUser(userId)
        await loadUsers()
      } catch (err: any) {
        error.value = err.message || 'Failed to ban user'
      }
    }

    const viewUserProfile = (userId: string) => {
      router.push(`/user/${userId}`)
    }

    const filteredUsers = computed(() => {
      return users.value.filter((user: User['user']) => {
        const matchesSearch =
          user.username.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          (user.full_name && user.full_name.toLowerCase().includes(searchQuery.value.toLowerCase()))

        const matchesRole = !roleFilter.value || user.role === roleFilter.value

        return matchesSearch && matchesRole
      })
    })

    onMounted(() => {
      loadUsers()
    })

    return {
      users,
      loading,
      error,
      searchQuery,
      roleFilter,
      filteredUsers,
      handleBanUser,
      viewUserProfile,
      loadUsers,
      getAvatarUrl,
      notification,
      notificationType
    }
  }
})
</script>

<style scoped>
@import "../../assets/style/user/AllUserView.css";
</style>
