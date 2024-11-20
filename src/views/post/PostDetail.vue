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
                        <div class="dropdown" v-if="user.user._id == post.authorId || user.user.role == 'admin'">
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
                                <img :src="imageUrl" alt="Post Image" class="img-fluid rounded shadow-sm" />
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
                            <div class="author-avatar">
                                <img :src="post.author?.profile.avatar || '/path/to/default-avatar.png'"
                                        :alt="post.username + '\'s avatar'" class="avatar-image" />
                            </div>
                            <div class="author-details">
                                <router-link :to="{ name: 'user', params: { id: post.authorId } }" class="router-link"> <strong> {{ post.author?.username }} </strong></router-link>
            
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
                                <div class="comment-avatar">
                                    <img :src="comment.avatar || '/path/to/default-avatar.png'"
                                        :alt="comment.username + '\'s avatar'" class="avatar-image" />
                                </div>
                                <router-link :to="{ name: 'user', params: { id: comment.userId } }" class="router-link"> <strong> {{ comment.username }} </strong></router-link>
                               
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
                                <button v-if="comment.userId == user.user._id || user.user.role == 'admin'"
                                    class="btn btn-outline-primary btn-sm me-2 btn-hover"
                                    @click="startEditComment(comment.id, comment.content)">
                                    Edit
                                </button>
                                <button v-if="comment.userId == user.user._id || user.user.role == 'admin'"
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
        <Notification v-if="notification" :message="notification" :notificationType="notificationType" />
    </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, computed, watch } from 'vue';
import { useNotificationsStore } from '@/stores/notifications'
import { usePostsStore } from '../../stores/posts';
import { useAuthStore } from '@/stores/auth';
import { useCommentsStore } from '../../stores/comments';
import { useRoute, useRouter } from 'vue-router';
import Notification from '../../components/Notification.vue'

export default defineComponent({
    components: {
        Notification
    },
    setup() {

        const authStore = useAuthStore();
        const postsStore = usePostsStore();
        const commentsStore = useCommentsStore();
        const notificationsStore = useNotificationsStore()

        const notification = ref<string | null>(null)
        const notificationType = ref<string>('info') // Default notification type
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
            return post.value.imageUrls[selectedImageIndex.value];
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
            // Lightbox returns
            selectedImageIndex,
            isLightboxVisible,
            currentImageUrl,
            viewImage,
            closeLightbox,
            previousImage,
            nextImage,
            notification,
            notificationType
        };
    }
});
</script>


<style scoped>
@import "../../assets/style/post/PostDetail.css";
</style>
