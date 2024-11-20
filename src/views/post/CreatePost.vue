<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-lg-8">
        <div class="card shadow-lg">
          <div class="card-header bg-primary text-white p-4">
            <h3 class="mb-0">
              <i class="fas fa-edit me-2"></i>Create New Post
            </h3>
          </div>
          
          <div class="card-body p-4">
            <!-- Loading Spinner -->
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

            <!-- Post Creation Form -->
            <form @submit.prevent="submitPost" class="needs-validation">
              <!-- Title Input -->
              <div class="mb-4">
                <label for="title" class="form-label fw-bold">
                  <i class="fas fa-heading me-2"></i>Title
                </label>
                <input 
                  type="text" 
                  v-model="newPost.title" 
                  class="form-control form-control-lg" 
                  id="title" 
                  placeholder="Enter your post title"
                  required 
                />
              </div>

              <!-- Body Input -->
              <div class="mb-4">
                <label for="body" class="form-label fw-bold">
                  <i class="fas fa-paragraph me-2"></i>Content
                </label>
                <textarea 
                  v-model="newPost.body" 
                  class="form-control" 
                  id="body" 
                  rows="6"
                  placeholder="Write your post content here..."
                  required
                ></textarea>
              </div>

              <!-- Image Upload -->
              <div class="mb-4">
                <label class="form-label fw-bold">
                  <i class="fas fa-images me-2"></i>Images
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
                    <p class="mb-0">Drag and drop images here or click to browse</p>
                    <small class="text-muted">Supported formats: JPG, PNG, GIF</small>
                  </label>
                </div>
              </div>

              <!-- Image Previews -->
              <div v-if="images.length" class="mb-4">
                <h5 class="mb-3">
                  <i class="fas fa-photo-video me-2"></i>Selected Images
                </h5>
                <div class="row g-3">
                  <div v-for="(image, index) in images" 
                       :key="index" 
                       class="col-6 col-md-4 col-lg-3">
                    <div class="image-preview-card">
                      <img 
                        :src="getImagePreviewUrl(image)" 
                        class="preview-image rounded" 
                        alt="Selected Image" 
                      />
                      <button 
                        type="button" 
                        class="btn-remove" 
                        @click="removeImage(index)"
                      >
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Submit Button -->
              <div class="d-grid gap-2">
                <button 
                  type="submit" 
                  class="btn btn-primary btn-lg"
                  :disabled="loading"
                >
                  <i class="fas fa-paper-plane me-2"></i>
                  {{ loading ? 'Creating Post...' : 'Create Post' }}
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
import { defineComponent, ref } from 'vue';
import { usePostsStore } from '../../stores/posts';
import { useRouter } from 'vue-router';


export default defineComponent({
  setup() {
    const postsStore = usePostsStore();
    const router = useRouter();

    const newPost = ref({
      title: '',
      body: ''
    });

    const images = ref<File[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    const onFileChange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (target.files) {
        images.value = [...images.value, ...Array.from(target.files)];
      }
    };

    const removeImage = (index: number) => {
      images.value.splice(index, 1);
    };

    const getImagePreviewUrl = (image: File) => {
      return URL.createObjectURL(image);
    };

    const submitPost = async () => {
      loading.value = true;
      error.value = null;
      try {
        const formData = new FormData();
        formData.append('title', newPost.value.title);
        formData.append('body', newPost.value.body);
        images.value.forEach((image) => {
          formData.append('images', image);
        });

        await postsStore.createPost(formData);
        router.push('/posts');
      } catch (err: any) {
        error.value = err.response?.data?.message || 'Failed to create post';
      } finally {
        loading.value = false;
      }
    };

    return {
      newPost,
      images,
      loading,
      error,
      onFileChange,
      submitPost,
      removeImage,
      getImagePreviewUrl,
    };
  }
});
</script>


<style scoped>
@import "../../assets/style/post/CreatePost.css";
</style>

