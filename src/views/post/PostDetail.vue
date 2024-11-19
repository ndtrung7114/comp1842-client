<!-- PostDetail.vue -->
<template>
    <div class="post-detail container mt-5">
        <div v-if="loading" class="text-center my-4 fade-in">
            <div class="spinner-border text-primary spinner-lg" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
        <div v-if="error" class="alert alert-danger shadow-sm slide-in">{{ error }}</div>

        <div v-if="post" class="fade-in">
            <div class="card mb-4 shadow-hover">
                <div class="card-body">
                    <div class="d-flex align-items-center justify-content-between mb-4">
                        <h1 class="post-title display-4 text-primary gradient-text">{{ post.title }}</h1>
                        <div class="dropdown" v-if="user.user.id == post.authorId || user.user.role == 'admin'">
                            <button class="btn btn-secondary dropdown-toggle btn-hover" type="button"
                                id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
                                Options
                            </button>
                            <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                <li><a class="dropdown-item hover-highlight" @click="editPost">Update</a></li>
                                <li><a class="dropdown-item text-danger hover-highlight" @click="deletePost">Delete</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <!-- Image Gallery -->
                    <div v-if="post.imageUrls && post.imageUrls.length > 0"
                        :class="['image-gallery-container', post.imageUrls.length === 1 ? 'single-image' : 'multi-image']">
                        <div
                            :class="['image-gallery', post.imageUrls.length === 1 ? 'single-image-gallery' : 'multi-image-gallery']">
                            <div v-for="(imageUrl, index) in post.imageUrls.slice(0, 4)" :key="index"
                                class="image-container zoom-effect" @click="viewImage(imageUrl)">
                                <img :src="BASE_URL + imageUrl" alt="Post Image" class="img-fluid rounded shadow-sm" />
                                <div class="image-overlay">
                                    <span class="zoom-icon">🔍</span>
                                </div>
                            </div>
                            <div v-if="post.imageUrls.length > 4" class="more-images shine-effect"
                                @click="viewImage(post.imageUrls[4])">
                                <span>+{{ post.imageUrls.length - 4 }}</span>
                            </div>
                        </div>
                    </div>


                    <div class="post-meta text-muted mb-3 slide-up">
                        <div class="author-info">
                            <div class="author-avatar">{{ post.username[0].toUpperCase() }}</div>
                            <div class="author-details">
                                <p>By <strong>{{ post.username }}</strong></p>
                                <p>Posted on {{ new Date(post.createdAt).toLocaleDateString() }}</p>
                            </div>
                        </div>
                    </div>

                    <p class="post-body fs-5 line-height-custom fade-in-delay">{{ post.body }}</p>
                </div>
            </div>

            <!-- Comments Section -->
            <div class="comments-section mt-5 fade-in-up">
                <h2 class="h4 mb-3 section-title">Comments ({{ comments.length }})</h2>
                <ul class="comments-list list-unstyled">
                    <li v-for="comment in comments" :key="comment.id"
                        class="comment-item p-3 mb-3 border rounded bg-light">
                        <div class="comment-header">
                            <div class="comment-author">
                                <div class="comment-avatar">{{ }}</div>
                                <strong>{{ comment.username }}</strong>
                            </div>
                        </div>

                        <div v-if="editingCommentId === comment.id" class="edit-form">
                            <textarea v-model="editedContent" class="form-control my-2 custom-input"
                                placeholder="Edit your comment here..."></textarea>
                            <button class="btn btn-success btn-sm me-2 btn-hover"
                                @click="saveComment(comment.id)">Save</button>
                            <button class="btn btn-secondary btn-sm btn-hover" @click="cancelEdit">Cancel</button>
                        </div>
                        <div v-else>
                            <p class="comment-content">{{ comment.content }}</p>
                            <p class="comment-date text-muted">{{ new Date(comment.createdAt).toLocaleString() }}</p>
                            <div class="comment-actions">
                                <button v-if="comment.userId == user.user.id || user.user.role == 'admin'"
                                    class="btn btn-outline-primary btn-sm me-2 btn-hover"
                                    @click="startEditComment(comment.id, comment.content)">
                                    Edit
                                </button>
                                <button v-if="comment.userId == user.user.id || user.user.role == 'admin'"
                                    class="btn btn-outline-danger btn-sm btn-hover" @click="deleteComment(comment.id)">
                                    Delete
                                </button>
                            </div>
                        </div>
                    </li>
                </ul>

                <div class="add-comment mt-4 comment-form-container">
                    <h3 class="h5 section-title">Leave a Comment</h3>
                    <textarea v-model="newComment" class="form-control my-2 custom-input"
                        placeholder="Write your comment here..."></textarea>
                    <button class="btn btn-primary btn-hover" @click="postComment" :disabled="!newComment.trim()">Post
                        Comment</button>
                </div>
            </div>
        </div>

        <!-- Image Lightbox Component -->
        <div v-if="isLightboxVisible" class="lightbox-overlay" @click="closeLightbox">
            <div class="lightbox-content" @click.stop>
                <button class="close-button" @click="closeLightbox">&times;</button>

                <div class="image-container">
                    <img :src="currentImageUrl" alt="Full size image" class="lightbox-image" />
                </div>

                <div class="navigation-controls">
                    <button class="nav-button prev" @click="previousImage" :disabled="selectedImageIndex === 0"
                        :class="{ 'disabled': selectedImageIndex === 0 }">
                        &#10094;
                    </button>
                    <span class="image-counter">
                        {{ selectedImageIndex + 1 }} / {{ post?.imageUrls?.length || 0 }}
                    </span>
                    <button class="nav-button next" @click="nextImage"
                        :disabled="selectedImageIndex === (post?.imageUrls?.length || 0) - 1"
                        :class="{ 'disabled': selectedImageIndex === (post?.imageUrls?.length || 0) - 1 }">
                        &#10095;
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, computed } from 'vue';
import { usePostsStore } from '../../stores/posts';
import { useAuthStore } from '@/stores/auth';
import { useCommentsStore } from '../../stores/comments';
import { useRoute, useRouter } from 'vue-router';

export default defineComponent({
    setup() {
        const BASE_URL = 'http://localhost:3500';
        const authStore = useAuthStore();
        const postsStore = usePostsStore();
        const commentsStore = useCommentsStore();
        const route = useRoute();
        const router = useRouter();

        // Image lightbox state
        const selectedImageIndex = ref(0);
        const isLightboxVisible = ref(false);

        // Computed properties
        const post = computed(() => postsStore.currentPost);
        const loading = computed(() => postsStore.isLoading);
        const error = computed(() => postsStore.error);
        const user = authStore.user;

        const currentImageUrl = computed(() => {
            if (!post.value?.imageUrls) return '';
            return BASE_URL + post.value.imageUrls[selectedImageIndex.value];
        });

        // Comments state
        const newComment = ref('');
        const editingCommentId = ref<string | null>(null);
        const editedContent = ref('');

        // Lightbox methods
        const viewImage = (imageUrl: string) => {
            const index = post.value?.imageUrls?.findIndex(url => url === imageUrl) ?? 0;
            selectedImageIndex.value = index;
            isLightboxVisible.value = true;
            // Add keyboard event listener
            window.addEventListener('keydown', handleKeyDown);
        };

        const closeLightbox = () => {
            isLightboxVisible.value = false;
            // Remove keyboard event listener
            window.removeEventListener('keydown', handleKeyDown);
        };

        const previousImage = () => {
            if (selectedImageIndex.value > 0) {
                selectedImageIndex.value--;
            }
        };

        const nextImage = () => {
            if (post.value?.imageUrls && selectedImageIndex.value < post.value.imageUrls.length - 1) {
                selectedImageIndex.value++;
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isLightboxVisible.value) return;

            switch (e.key) {
                case 'ArrowLeft':
                    previousImage();
                    break;
                case 'ArrowRight':
                    nextImage();
                    break;
                case 'Escape':
                    closeLightbox();
                    break;
            }
        };

        // Existing methods
        onMounted(async () => {
            const postId = route.params.id as string;
            await postsStore.getPostById(postId);
            await commentsStore.getCommentsByPostId(postId);
        });

        const startEditComment = (commentId: string, content: string) => {
            editingCommentId.value = commentId;
            editedContent.value = content;
        };

        const cancelEdit = () => {
            editingCommentId.value = null;
            editedContent.value = '';
        };

        const saveComment = async (commentId: string) => {
            if (editedContent.value.trim()) {
                try {
                    await commentsStore.updateComment(commentId, editedContent.value);
                    await commentsStore.getCommentsByPostId(post.value!.id);
                    cancelEdit();
                } catch (error) {
                    console.error("Failed to update comment:", error);
                }
            }
        };

        const deleteComment = async (commentId: string) => {
            if (confirm("Are you sure you want to delete this comment?")) {
                await commentsStore.deleteComment(commentId);
                await commentsStore.getCommentsByPostId(post.value!.id);
            }
        };

        const editPost = () => {
            if (post.value) {
                router.push({ name: 'edit-post', params: { id: post.value.id } });
            }
        };

        const deletePost = async () => {
            if (post.value && confirm("Are you sure you want to delete this post?")) {
                await postsStore.deletePost(post.value.id);
                router.push('/posts');
            }
        };

        const postComment = async () => {
            if (post.value) {
                const commentData = {
                    postId: post.value.id,
                    content: newComment.value,
                };
                await commentsStore.createComment(commentData.postId, commentData.content);
                await commentsStore.getCommentsByPostId(post.value.id);
                newComment.value = '';
            }
        };

        return {
            post,
            loading,
            error,
            editPost,
            deletePost,
            comments: computed(() => commentsStore.comments),
            user,
            newComment,
            postComment,
            editingCommentId,
            editedContent,
            startEditComment,
            cancelEdit,
            saveComment,
            deleteComment,
            BASE_URL,
            // Lightbox returns
            selectedImageIndex,
            isLightboxVisible,
            currentImageUrl,
            viewImage,
            closeLightbox,
            previousImage,
            nextImage,
        };
    }
});
</script>

<style scoped>
/* Animations */
.fade-in {
    animation: fadeIn 0.5s ease-in;
}

.fade-in-delay {
    animation: fadeIn 0.8s ease-in;
}

.fade-in-up {
    animation: fadeInUp 0.6s ease-out;
}

.slide-in {
    animation: slideIn 0.4s ease-out;
}

.slide-up {
    animation: slideUp 0.5s ease-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateX(-20px);
    }

    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* General Styles */
.spinner-lg {
    width: 3rem;
    height: 3rem;
}

.shadow-hover {
    transition: all 0.3s ease;
    border: none;
}

.shadow-hover:hover {
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
}

.gradient-text {
    background: linear-gradient(45deg, #2196F3, #4CAF50);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.section-title {
    position: relative;
    padding-left: 15px;
    border-left: 4px solid #2196F3;
}

/* Button Styles */
.btn-hover {
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.btn-hover:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.btn-hover::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.2);
    transform: translateX(-100%);
    transition: transform 0.3s ease;
}

.btn-hover:hover::after {
    transform: translateX(0);
}

/* Image Gallery */
.image-gallery-container {
    margin: 20px 0;
}

.image-gallery-container.single-image {
    display: flex;
    justify-content: center;
}

.image-gallery.single-image-gallery {
    max-width: 500px;
    /* Adjust width as necessary */
    margin: 0 auto;
}

.image-gallery {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
    margin-bottom: 20px;
}

.image-container {
    position: relative;
    overflow: hidden;
    border-radius: 8px;
    aspect-ratio: 16/9;
}

.zoom-effect {
    transition: transform 0.3s ease;
}

.zoom-effect:hover {
    transform: scale(1.05);
}

.image-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.image-container:hover .image-overlay {
    opacity: 1;
}

.zoom-icon {
    color: white;
    font-size: 24px;
}

.more-images {
    position: absolute;
    bottom: 10px;
    right: 10px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 5px 15px;
    border-radius: 20px;
    font-weight: bold;
}

/* Author & Comment Styles */
.author-info {
    display: flex;
    align-items: center;
    gap: 15px;
}

.author-avatar,
.comment-avatar {
    width: 40px;
    height: 40px;
    background: linear-gradient(45deg, #2196F3, #4CAF50);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
}

.comment-avatar {
    width: 32px;
    height: 32px;
    font-size: 0.875rem;
}

.comment-item {
    transition: all 0.3s ease;
    border-left: 4px solid transparent;
}

.comment-item:hover {
    border-left-color: #2196F3;
    transform: translateX(5px);
}

.comment-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
}

.comment-content {
    line-height: 1.6;
    margin: 10px 0;
}

.comment-actions {
    opacity: 0;
    transition: opacity 0.3s ease;
}

.comment-item:hover .comment-actions {
    opacity: 1;
}

/* Form Styles */
.custom-input {
    border: 1px solid #ddd;
    border-radius: 8px;
    transition: all 0.3s ease;
    background: #f8f9fa;
}

.custom-input:focus {
    border-color: #2196F3;
    box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
    background: white;
}

.comment-form-container {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* Hover Effects */
.hover-highlight {
    transition: background-color 0.3s ease;
}

.hover-highlight:hover {
    background-color: #f8f9fa;
}

/* Line Height */
.line-height-custom {
    line-height: 1.8;
}

/* Shine Effect */
.shine-effect {
    position: relative;
    overflow: hidden;
}

.shine-effect::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(to bottom right,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.1) 50%,
            rgba(255, 255, 255, 0) 100%);
    transform: rotate(45deg);
    animation: shine 3s infinite;
}

@keyframes shine {
    0% {
        transform: translateX(-100%) rotate(45deg);
    }

    100% {
        transform: translateX(100%) rotate(45deg);
    }
}

.lightbox-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    animation: fadeIn 0.3s ease-out;
}

.lightbox-content {
    position: relative;
    max-width: 90vw;
    max-height: 90vh;
}

.lightbox-image {
    max-width: 100%;
    max-height: 90vh;
    object-fit: contain;
}

.close-button {
    position: absolute;
    top: -40px;
    right: -40px;
    background: transparent;
    border: none;
    color: white;
    font-size: 2rem;
    cursor: pointer;
    padding: 10px;
    z-index: 1001;
}

.navigation-controls {
    position: absolute;
    bottom: -50px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 20px;
}

.nav-button {
    background: transparent;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 10px;
    transition: opacity 0.3s ease;
}

.nav-button.disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.image-counter {
    color: white;
    font-size: 1rem;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}
</style>
