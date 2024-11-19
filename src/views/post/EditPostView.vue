<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-lg-8">
        <div class="card shadow-lg">
          <div class="card-header bg-primary text-white p-4">
            <h3 class="mb-0">
              <i class="fas fa-edit me-2"></i>Edit Post
            </h3>
          </div>

          <div class="card-body p-4">
            <!-- Loading State -->
            <div v-if="loading" class="text-center my-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>

            <!-- Error Alert -->
            <div v-if="error" class="alert alert-danger alert-dismissible fade show" role="alert">
              {{ error }}
              <button type="button" class="btn-close" @click="error = null"></button>
            </div>

            <!-- Edit Form -->
            <form @submit.prevent="submitEdit" class="needs-validation" v-if="!loading">
              <!-- Title Input -->
              <div class="mb-4">
                <label for="title" class="form-label fw-bold">
                  <i class="fas fa-heading me-2"></i>Title
                </label>
                <input 
                  type="text" 
                  v-model="post.title" 
                  class="form-control form-control-lg" 
                  id="title" 
                  placeholder="Enter post title"
                  required 
                />
              </div>

              <!-- Body Input -->
              <div class="mb-4">
                <label for="body" class="form-label fw-bold">
                  <i class="fas fa-paragraph me-2"></i>Content
                </label>
                <textarea 
                  v-model="post.body" 
                  class="form-control" 
                  id="body" 
                  rows="6"
                  placeholder="Write your post content here..."
                  required
                ></textarea>
              </div>

              <!-- Existing Images -->
              <div v-if="existingImages.length" class="mb-4">
                <h5 class="mb-3">
                  <i class="fas fa-images me-2"></i>Current Images
                </h5>
                <div class="row g-3">
                  <div v-for="(image, index) in existingImages" 
                       :key="'existing-' + index" 
                       class="col-6 col-md-4 col-lg-3">
                    <div class="image-preview-card">
                      <img 
                        :src="BASE_URL + image" 
                        class="preview-image rounded" 
                        alt="Existing Image" 
                      />
                      <button 
                        type="button" 
                        class="btn-remove" 
                        @click="removeExistingImage(index)"
                      >
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- New Image Upload -->
              <div class="mb-4">
                <label class="form-label fw-bold">
                  <i class="fas fa-plus-circle me-2"></i>Add New Images
                </label>
                <div class="upload-box p-4 text-center border rounded bg-light">
                  <input 
                    type="file" 
                    @change="onFileChange" 
                    accept="image/*" 
                    multiple 
                    class="d-none" 
                    id="imageInput"
                  />
                  <label for="imageInput" class="mb-0 upload-label">
                    <i class="fas fa-cloud-upload-alt fs-1 text-primary mb-3"></i>
                    <p class="mb-0">Drag and drop new images here or click to browse</p>
                    <small class="text-muted">Supported formats: JPG, PNG, GIF</small>
                  </label>
                </div>
              </div>

              <!-- New Image Previews -->
              <div v-if="newImages.length" class="mb-4">
                <h5 class="mb-3">
                  <i class="fas fa-photo-video me-2"></i>New Images to Add
                </h5>
                <div class="row g-3">
                  <div v-for="(image, index) in newImages" 
                       :key="'new-' + index" 
                       class="col-6 col-md-4 col-lg-3">
                    <div class="image-preview-card">
                      <img 
                        :src="getImagePreviewUrl(image)" 
                        class="preview-image rounded" 
                        alt="New Image" 
                      />
                      <button 
                        type="button" 
                        class="btn-remove" 
                        @click="removeNewImage(index)"
                      >
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Submit Buttons -->
              <div class="d-grid gap-2">
                <button 
                  type="submit" 
                  class="btn btn-primary btn-lg"
                  :disabled="loading"
                >
                  <i class="fas fa-save me-2"></i>
                  {{ loading ? 'Saving Changes...' : 'Save Changes' }}
                </button>
                <button 
                  type="button" 
                  class="btn btn-outline-secondary"
                  @click="router.back()"
                >
                  <i class="fas fa-arrow-left me-2"></i>Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { usePostsStore } from '../../stores/posts';
import type { Post } from '../../stores/posts';
import { useRoute, useRouter } from 'vue-router';

export default defineComponent({
  setup() {
    const BASE_URL = import.meta.env.VITE_API_URI as string; // Update with your API URL
    const postsStore = usePostsStore();
    const route = useRoute();
    const router = useRouter();

    const post = ref<Omit<Post, 'id' | 'createdAt' | 'updatedAt'>>({
      title: '',
      body: '',
      authorId: '',
      username: ''
    });
    
    const existingImages = ref<string[]>([]); // Store existing image URLs
    const newImages = ref<File[]>([]); // Store new images to be uploaded
    const loading = ref(true);
    const error = ref<string | null>(null);

    onMounted(async () => {
      const postId = route.params.id;
      if (typeof postId === 'string' && postId.length === 24) {
        try {
          await postsStore.getPostById(postId);
          const currentPost = postsStore.currentPost;

          if (currentPost) {
            post.value = {
              title: currentPost.title || '',
              body: currentPost.body || '',
              authorId: currentPost.authorId || '',
              username: currentPost.username || ''
            };
            // Load existing images if any
            existingImages.value = currentPost.imageUrls || [];
          }
        } catch (err: any) {
          error.value = err.message || 'Failed to load post';
        } finally {
          loading.value = false;
        }
      } else {
        error.value = 'Invalid post ID';
        loading.value = false;
      }
    });

    const onFileChange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (target.files) {
        newImages.value = [...newImages.value, ...Array.from(target.files)];
      }
    };

    const removeNewImage = (index: number) => {
      newImages.value.splice(index, 1);
    };

    const removeExistingImage = (index: number) => {
      existingImages.value.splice(index, 1);
    };

    const getImagePreviewUrl = (image: File) => {
      return URL.createObjectURL(image);
    };

    const submitEdit = async () => {
  loading.value = true;
  error.value = null;

  try {
    const postId = route.params.id as string;
    const formData = new FormData();

    // Append basic post data to FormData
    formData.append('title', post.value.title);
    formData.append('body', post.value.body);


    // Append existing images that weren't removed
    // This will let backend know which images to keep
    formData.append('imageUrls', JSON.stringify(existingImages.value));

    // Append new images with a different field name
    newImages.value.forEach((image) => {
      formData.append(`images`, image); // Use consistent field name
    });

    // Log formData contents for debugging
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }
    // Now send the FormData with your post data
    await postsStore.updatePost(postId, formData);
    router.push(`/posts/${postId}`);
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to update post';
    loading.value = false;
  }
};

    return {
      post,
      loading,
      error,
      existingImages,
      newImages,
      BASE_URL,
      router,
      onFileChange,
      removeNewImage,
      removeExistingImage,
      getImagePreviewUrl,
      submitEdit,
    };
  },
});
</script>

<style scoped>
.card {
  border: none;
  border-radius: 15px;
  overflow: hidden;
}

.upload-box {
  border: 2px dashed #dee2e6;
  transition: all 0.3s ease;
  cursor: pointer;
}

.upload-box:hover {
  border-color: #0d6efd;
  background-color: #f8f9fa;
}

.upload-label {
  cursor: pointer;
  display: block;
}

.image-preview-card {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.preview-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
  display: block;
  transition: all 0.3s ease;
}

.preview-image:hover {
  transform: scale(1.05);
}

.btn-remove {
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 25px;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 1;
}

.btn-remove:hover {
  background-color: #dc3545;
  color: white;
}

.form-control {
  border: 2px solid #dee2e6;
  padding: 0.75rem;
  transition: all 0.2s ease;
}

.form-control:focus {
  border-color: #0d6efd;
  box-shadow: none;
}

.btn {
  padding: 12px 24px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.card-header {
  background: linear-gradient(45deg, #0d6efd, #0a58ca);
}

/* Animation for loading state */
.spinner-border {
  width: 3rem;
  height: 3rem;
}

/* Smooth transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>