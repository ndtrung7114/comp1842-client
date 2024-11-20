<template>
  <div class="container py-5">
    <!-- Loading State -->
    <div v-if="!userView?.userView" class="d-flex justify-content-center">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else class="row">
      <!-- Left Column - Profile Info -->
      <div class="col-lg-4 mb-4">
        <!-- Profile card remains unchanged -->
        <div class="card border-0 shadow-sm">
          <div class="position-relative">
            <div class="bg-primary" style="height: 150px;"></div>
            <div class="position-absolute w-100 d-flex justify-content-center" style="bottom: -50px;">
              <img :src=" userView.userView.profile?.avatar || 'https://via.placeholder.com/150'"
                class="rounded-circle border border-4 border-white shadow-sm" alt="Profile Avatar"
                style="width: 100px; height: 100px; object-fit: cover;" />
            </div>
          </div>

          <div class="card-body text-center pt-5 mt-3">
            <!-- Profile info remains unchanged -->
            <h4 class="mb-0">{{ userView.userView.first_name }} {{ userView.userView.last_name }}</h4>
            <p class="text-muted mb-2">@{{ userView.userView.username }}</p>
            <p class="small text-muted mb-3">
              <i class="fas fa-map-marker-alt me-2"></i>
              Ha Noi, Viet Nam
            </p>

            <!-- Stats section remains unchanged -->
            <div class="d-flex justify-content-center mb-4">
              <div class="px-3 text-center border-end">
                <h6 class="mb-0">{{ userPosts.length }}</h6>
                <small class="text-muted">Posts</small>
              </div>
              <div class="px-3 text-center border-end">
                <h6 class="mb-0">{{ userView.userView.followers?.length }}</h6>
                <small class="text-muted">Followers</small>
              </div>
              <div class="px-3 text-center">
                <h6 class="mb-0">{{ userView.userView.following?.length }}</h6>
                <small class="text-muted">Following</small>
              </div>
            </div>

            <!-- Action buttons remain unchanged -->
            <div v-if="userId != userIdIsLogged" class="d-flex justify-content-center gap-2 mb-3">
              <a v-if="userView.userView.profile?.facebook" :href="userView.userView.profile.facebook"
                class="btn btn-outline-primary btn-sm" target="_blank">
                <i class="fab fa-facebook me-2"></i>Facebook
              </a>
              <button class="btn btn-primary btn-sm">
                <i class="fas fa-user-plus me-2"></i>Follow
              </button>
              <button v-if="userId != userIdIsLogged" class="btn btn-outline-primary btn-sm"
                @click="showChatBox = true">
                <i class="fas fa-message me-2"></i>Message
              </button>
            </div>

            <!-- Contact Info remains unchanged -->
            <div class="border-top pt-3">
              <div class="mb-2">
                <i class="fas fa-envelope me-2 text-muted"></i>
                {{ userView.userView.email }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column - Content -->
      <div class="col-lg-8">
        <div class="card border-0 shadow-sm">
          <!-- Tabs remain unchanged -->
          <div class="card-header bg-white border-bottom-0 pb-0">
            <ul class="nav nav-tabs card-header-tabs">
              <li class="nav-item">
                <a class="nav-link active" data-bs-toggle="tab" href="#posts">
                  <i class="fas fa-th me-2"></i>Posts
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" data-bs-toggle="tab" href="#about">
                  <i class="fas fa-user me-2"></i>About
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" data-bs-toggle="tab" href="#media">
                  <i class="fas fa-image me-2"></i>Media
                </a>
              </li>
              <li v-if="userIdIsLogged == userId ">
                <a class="nav-link" data-bs-toggle="tab" href="#edit" >
                  <i class="fas fa-edit me-2"></i>Edit
                </a>
              </li>
            </ul>
          </div>

          <!-- Tab Content -->
          <div class="card-body">
            <div class="tab-content">
              <!-- Posts Tab -->
              <div class="tab-pane fade show active" id="posts">
                <div v-if="loading" class="text-center py-5">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading posts...</span>
                  </div>
                </div>
                <div v-else-if="userPosts.length === 0" class="text-center py-5">
                  <i class="fas fa-scroll fa-3x text-muted mb-3"></i>
                  <p class="text-muted">No posts found.</p>
                </div>
                <div v-else class="row g-4">
                  <div v-for="post in userPosts" :key="post.id" class="col-md-6">
                    <div class="card h-100 border-0 shadow-sm hover-shadow transition">
                      <!-- Image Carousel -->
                      <div class="position-relative">
                        <div v-if="post.imageUrls && post.imageUrls.length > 0">
                          <div :id="'carousel-' + post.id" class="carousel slide" data-bs-ride="carousel">
                            <div class="carousel-inner">
                              <div v-for="(imageUrl, index) in post.imageUrls" :key="index" class="carousel-item"
                                :class="{ active: index === 0 }">
                                <img :src=" imageUrl" class="d-block w-100" alt="Post Image"
                                  style="height: 200px; object-fit: cover;" />
                              </div>
                            </div>
                            <!-- Only show controls if there are multiple images -->
                            <template v-if="post.imageUrls.length > 1">
                              <button class="carousel-control-prev" type="button"
                                :data-bs-target="'#carousel-' + post.id" data-bs-slide="prev">
                                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                                <span class="visually-hidden">Previous</span>
                              </button>
                              <button class="carousel-control-next" type="button"
                                :data-bs-target="'#carousel-' + post.id" data-bs-slide="next">
                                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                                <span class="visually-hidden">Next</span>
                              </button>
                              <!-- Image counter badge -->
                              <div class="position-absolute bottom-0 end-0 mb-2 me-2">
                                <span class="badge bg-dark bg-opacity-75">
                                  1/{{ post.imageUrls.length }}
                                </span>
                              </div>
                            </template>
                          </div>
                        </div>
                        <!-- Fallback image when no images are available -->
                        <div v-else>
                          <img src="https://via.placeholder.com/300x200" class="card-img-top" alt="No Image Available"
                            style="height: 200px; object-fit: cover;" />
                        </div>
                      </div>
                      <div class="card-body">
                        <span class="badge bg-light text-primary mb-2">Blog</span>
                        <h6 class="card-title">{{ post.title }}</h6>
                        <p class="card-text small text-muted">
                          {{ post.body?.substring(0, 100) }}...
                        </p>
                        <router-link :to="{ name: 'post-detail', params: { id: post.id } }"
                          class="btn btn-primary btn-sm">
                          Read More
                        </router-link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- About Tab -->
              <div class="tab-pane fade" id="about">
                <div class="p-3">
                  <h5 class="mb-4">About Me</h5>
                  <div class="mb-4">
                    <p class="text-muted mb-1">Email</p>
                    <p><i class="fas fa-envelope me-2"></i>{{ userView.userView.email }}</p>
                  </div>
                  <div class="mb-4">
                    <p class="text-muted mb-1">Member Since</p>
                    <p><i class="fas fa-calendar me-2"></i>January 2024</p>
                  </div>
                </div>
              </div>

              <!-- Media Tab -->
              <div class="tab-pane fade" id="media">
                <div class="row g-3">
                  <div v-for="post in userPosts" :key="post.id" class="col-md-4">
                    <!-- Only show if post has images -->
                    <div v-if="post.imageUrls && post.imageUrls.length > 0" class="position-relative media-item">
                      <div class="ratio ratio-1x1">
                        <img :src=" post.imageUrls[0]" class="img-fluid rounded object-fit-cover"
                          alt="Gallery image" @click="openLightbox(post.imageUrls, post.id)" />
                      </div>
                      <!-- Multiple images indicator -->
                      <div v-if="post.imageUrls.length > 1" class="position-absolute top-0 end-0 m-2">
                        <span class="badge bg-dark bg-opacity-75">
                          <i class="fas fa-images me-1"></i>
                          {{ post.imageUrls.length }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Edit Tab -->
              <div class="tab-pane fade" id="edit">
                <div class="p-4">
                  <h5 class="mb-4">Edit Profile</h5>
                  <form @submit.prevent="handleSubmit" class="row g-3">
                    <!-- Avatar Upload -->
                    <div class="col-12 mb-4 text-center">
                      <div class="position-relative d-inline-block">
                        <img
                          :src="avatarPreview ||
                            (userView.userView.profile?.avatar ?  userView.userView.profile.avatar : 'https://via.placeholder.com/150')"
                          class="rounded-circle border border-4 border-white shadow-sm" alt="Profile Avatar"
                          style="width: 150px; height: 150px; object-fit: cover;" />
                        <label for="avatar-upload"
                          class="position-relative bottom-0 end-0 bg-white rounded-circle p-2 shadow-sm cursor-pointer">
                          <i class="fas fa-camera text-primary"></i>
                          <input type="file" id="avatar-upload" class="d-none" accept="image/*"
                            @change="handleAvatarChange" />
                        </label>
                      </div>
                    </div>

                    <!-- User Information -->
                    <div class="col-md-6">
                      <label class="form-label">First Name</label>
                      <input type="text" class="form-control" v-model="formData.first_name" required>
                    </div>

                    <div class="col-md-6">
                      <label class="form-label">Last Name</label>
                      <input type="text" class="form-control" v-model="formData.last_name" required>
                    </div>

                    <div class="col-md-6">
                      <label class="form-label">Username</label>
                      <input type="text" class="form-control" v-model="formData.username" required>
                    </div>

                    <div class="col-md-6">
                      <label class="form-label">Email</label>
                      <input type="email" class="form-control" v-model="formData.email" required>
                    </div>

                    <div class="col-12">
                      <label class="form-label">Facebook Profile</label>
                      <div class="input-group">
                        <span class="input-group-text"><i class="fab fa-facebook"></i></span>
                        <input type="url" class="form-control" v-model="formData.profile.facebook"
                          placeholder="Facebook profile URL">
                      </div>
                    </div>

                    <!-- Submit Button -->
                    <div class="col-12 mt-4">
                      <div class="d-flex gap-2">
                        <button type="submit" class="btn btn-primary" :disabled="isSubmitting || !hasChanges">
                          <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2"></span>
                          {{ isSubmitting ? 'Updating...' : 'Update Profile' }}
                        </button>
                        <button type="button" class="btn btn-outline-secondary" @click="resetForm"
                          :disabled="!hasChanges">
                          Reset
                        </button>
                      </div>
                    </div>
                    <div class="col-12 mt-4 border-top pt-4">
                      <h6 class="mb-3">Security Settings</h6>
                      <RouterLink v-if="userView.userView?.email" :to="{
                        name: 'update-password',
                        params: {
                          email: userView.userView.id
                        }
                      }" class="btn btn-outline-warning">
                        <i class="fas fa-key me-2"></i>
                        Change Password
                      </RouterLink>
                    </div>

                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <Notification
      v-if="notification"
      :message="notification"
      :notificationType="notificationType"
    />

  <ChatBox v-model="showChatBox" :recipient-id="userId"
    :recipient-name="`${userView.userView?.first_name} ${userView.userView?.last_name}`"
    :recipient-avatar="userView.userView?.profile?.avatar ?  userView.userView.profile.avatar : undefined"
    @message-sent="handleMessageSent" />
</template>

<script setup lang="ts">
import { useAuthStore } from '../../stores/auth';
import { usePostsStore } from '@/stores/posts';
import { computed, onMounted, ref, watch, reactive } from 'vue';
import type { Post } from '@/stores/posts';
import { useRoute } from 'vue-router';
import ChatBox from '../message/ChatBox.vue';
const notificationsStore = useNotificationsStore()
import { useNotificationsStore } from '@/stores/notifications'
import Notification from '../../components/Notification.vue'

const notification = ref<string | null>(null)
const notificationType = ref<string>('info') // Default notification type
const authStore = useAuthStore();
const postStore = usePostsStore();
const route = useRoute();

const userId = computed(() => route.params.id as string);
const userIdIsLogged = computed(() => authStore.user.user?._id);
const userPosts = ref<Post[]>([]);
const loading = ref(true);
const showChatBox = ref(false);
const userView = computed(() => {
  return authStore.userDetailView;
});

interface ProfileFormData {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  profile: {
    facebook: string;
    avatar: string;
  };
}
const initialFormData = ref<any>(null);
// Form data
const formData = reactive<ProfileFormData>({
  first_name: '',
  last_name: '',
  username: '',
  email: '',
  profile: {
    facebook: '',
    avatar: ''
  }
});

// Define valid field names
type ProfileFormField = keyof Omit<ProfileFormData, 'profile'>;

const avatarPreview = ref<string | null>(null);
const newAvatar = ref<File | null>(null);
const isSubmitting = ref(false);

const handleMessageSent = () => {
  // Optionally show a success message
  setTimeout(() => {
    showChatBox.value = false;
  }, 1000);
};

// Check if form has changes
const hasChanges = computed(() => {
  if (!initialFormData.value) return false;

  return (
    formData.first_name !== initialFormData.value.first_name ||
    formData.last_name !== initialFormData.value.last_name ||
    formData.username !== initialFormData.value.username ||
    formData.email !== initialFormData.value.email ||
    formData.profile.facebook !== initialFormData.value.profile.facebook ||
    newAvatar.value !== null
  );
});

// Initialize form with current user data
watch(userView, (newValue) => {
  if (newValue?.userView) {
    const userData = newValue.userView;
    formData.first_name = userData.first_name;
    formData.last_name = userData.last_name;
    formData.username = userData.username;
    formData.email = userData.email;
    formData.profile.facebook = userData.profile?.facebook || '';
    formData.profile.avatar = userData.profile?.avatar || '';

    // Store initial form data for comparison
    initialFormData.value = {
      first_name: userData.first_name,
      last_name: userData.last_name,
      username: userData.username,
      email: userData.email,
      profile: {
        facebook: userData.profile?.facebook || '',
        avatar: userData.profile?.avatar || ''
      }
    };
  }
}, { immediate: true });

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

// Type guard to check if a string is a valid field name
function isValidField(field: string): field is ProfileFormField {
  return ['first_name', 'last_name', 'username', 'email'].includes(field);
}

// Updated hasFieldChanged function with proper typing
const hasFieldChanged = (field: string): boolean => {
  if (!initialFormData.value) return false;

  if (field === 'facebook') {
    return formData.profile.facebook !== initialFormData.value.profile.facebook;
  }

  if (isValidField(field)) {
    return formData[field] !== initialFormData.value[field];
  }

  return false;
};

// Handle avatar change
const handleAvatarChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    newAvatar.value = target.files[0];
    avatarPreview.value = URL.createObjectURL(target.files[0]);
  }
};

// Handle form submission
const handleSubmit = async () => {
  try {
    isSubmitting.value = true;
    const submitData = new FormData();
    let hasChanges = false;

    // Only append fields that have changed
    if (hasFieldChanged('first_name')) {
      submitData.append('first_name', formData.first_name);
      hasChanges = true;
    }
    if (hasFieldChanged('last_name')) {
      submitData.append('last_name', formData.last_name);
      hasChanges = true;
    }
    if (hasFieldChanged('username')) {
      submitData.append('username', formData.username);
      hasChanges = true;
    }
    if (hasFieldChanged('email')) {
      submitData.append('email', formData.email);
      hasChanges = true;
    }
    if (hasFieldChanged('facebook')) {
      submitData.append('facebook', formData.profile.facebook);
      hasChanges = true;
    }

    // Only append image if a new one is selected
    if (newAvatar.value) {
      submitData.append('images', newAvatar.value);
      hasChanges = true;
    }

    // Only make the API call if there are actual changes
    if (!hasChanges) {
      alert('No changes to update!');
      return;
    }

    // Update user profile
    await authStore.updateUser(userId.value, submitData);

    // Refresh user data
    await getUser();

    // Update initial form data to reflect new values
    initialFormData.value = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      username: formData.username,
      email: formData.email,
      profile: {
        facebook: formData.profile.facebook,
        avatar: formData.profile.avatar
      }
    };

    // Only reset avatar preview if a new avatar was uploaded
    if (newAvatar.value) {
      avatarPreview.value = null;
      newAvatar.value = null;
    }

    alert('Profile updated successfully!');
  } catch (error) {
    console.error('Error updating profile:', error);
    alert('Error updating profile. Please try again.');
  } finally {
    isSubmitting.value = false;
  }
};

// Reset form to original values
const resetForm = () => {
  if (initialFormData.value) {
    formData.first_name = initialFormData.value.first_name;
    formData.last_name = initialFormData.value.last_name;
    formData.username = initialFormData.value.username;
    formData.email = initialFormData.value.email;
    formData.profile.facebook = initialFormData.value.profile.facebook;
    avatarPreview.value = null;
    newAvatar.value = null;
  }
};

async function getUser() {
  try {
    loading.value = true;
    await authStore.viewUser(userId.value);

    if (userView.value?.userView?.posts?.length) {
      const posts = await Promise.all(
        userView.value.userView.posts.map((postId: string) =>
          postStore.getPostById(postId)
        )
      );
      userPosts.value = posts.filter((post): post is Post => post !== null);
    } else {
      userPosts.value = [];
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
  } finally {
    loading.value = false;
  }
}

// Updated to handle array of strings
function openLightbox(images: string[] | undefined, postId: string) {
  if (images && images.length > 0) {
    console.log('Opening lightbox for post:', postId, 'with images:', images);
    // Implement lightbox functionality here
  }
}

// Watch for changes in the route parameter
watch(
  () => route.params.id,
  (newId, oldId) => {
    if (newId !== oldId) {
      getUser();
    }
  }
);

onMounted(() => {
  getUser();
});
</script>


<style scoped>
@import "../../assets/style/user/UserView.css";
</style>