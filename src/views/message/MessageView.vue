<template>
    <div class="messages-container">
        <!-- Main container with two columns -->
        <div class="row h-100 m-0">
            <!-- Left Column - Conversations List -->
            <div class="col-md-4 col-12 p-0 border-end conversations-column">
                <div class="conversations-header p-3 border-bottom">
                    <h5 class="m-0">Messages</h5>
                </div>

                <!-- Conversations List -->
                <div class="conversations-list p-2">
                    <div v-for="conversation in messagesStore.allMessages" 
                         :key="conversation.userId"
                         :class="['conversation-item p-2', { 'active': selectedUser?.userId === conversation.userId }]" 
                         @click="loadMessageDetail(conversation.userId)">
                        <div class="d-flex align-items-center">
                            <div class="conversation-avatar">
                                <img v-if="conversation.avatar" 
                                     :src="BASE_URL + conversation.avatar" 
                                     :alt="conversation.username"
                                     class="avatar-image" />
                                <div v-else class="avatar-placeholder">
                                    {{ getInitials(conversation.username) }}
                                </div>
                            </div>
                            <div class="conversation-content ms-3 flex-grow-1">
                                <div class="d-flex justify-content-between align-items-center">
                                    <h6 class="mb-0">{{ conversation.username }}</h6>
                                    <small class="text-muted">{{ formatTimeAgo(conversation.sentAt) }}</small>
                                </div>
                                <div class="message-preview-container">
                                    <p :class="['mb-0', 'text-truncate', { 'unread-message': !conversation.is_read }]">
                                        {{ conversation.lastSenderId === userId
                                            ? (conversation.lastMessage === "" ? 'You have sent image' : 'You: ' + conversation.lastMessage)
                                            : (conversation.lastMessage === "" ? `${conversation.username} has sent images` : conversation.lastMessage)
                                        }}
                                    </p>
                                    <div v-if="conversation.unreadCount && conversation.unreadCount > 0" 
                                         class="unread-badge">
                                        {{ conversation.unreadCount }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right Column - Messages -->
            <div class="col-md-8 col-12 p-0 messages-column">
                <div class="messages-header p-3 border-bottom">
                    <div class="d-flex align-items-center">
                        <div class="conversation-avatar">
                            <img v-if="selectedUser?.avatar" 
                                 :src="BASE_URL + selectedUser.avatar" 
                                 :alt="selectedUser?.username"
                                 class="avatar-image" />
                            <div v-else class="avatar-placeholder">
                                {{ selectedUser ? getInitials(selectedUser.username) : '' }}
                            </div>
                        </div>
                        <h5 class="mb-0 ms-3">{{ selectedUser?.username }}</h5>
                    </div>
                </div>

                <div class="messages-content p-3">
                    <div v-for="message in messageDetails" 
                         :key="message._id" 
                         :class="['message mb-3', message.sender === userId ? 'sent' : 'received']">
                        <div class="message-content">
                            {{ message.content }}
                            <div v-if="message.imageUrls && message.imageUrls.length > 0" class="message-images">
                                <img v-for="imageUrl in message.imageUrls" 
                                     :key="imageUrl" 
                                     :src="BASE_URL + imageUrl"
                                     class="message-image" />
                            </div>
                            <small class="message-time">{{ formatTimeAgo(message.sent_at.toString()) }}</small>
                        </div>
                    </div>
                </div>

                <div class="message-input-container p-3 border-top">
                    <div class="input-group">
                        <input type="text" 
                               v-model="messageContent" 
                               class="form-control"
                               placeholder="Type a message..." 
                               @keyup.enter="sendMessage" />
                        <div class="input-group-append">
                            <div class="input-group-text">
                                <label for="imageInput" class="mb-0 upload-label">
                                    <i class="fas fa-image"></i>
                                </label>
                                <input type="file" 
                                       @change="onFileChange" 
                                       accept="image/*" 
                                       multiple 
                                       class="d-none"
                                       id="imageInput" />
                            </div>
                            <button class="btn btn-primary" @click="sendMessage">
                                <i class="fas fa-paper-plane"></i> Send
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Image Previews -->
                <div v-if="images.length" class="message-images-container p-3">
                    <div v-for="(image, index) in images" 
                         :key="index" 
                         class="image-preview-card">
                        <img :src="getImagePreviewUrl(image)" 
                             class="preview-image rounded" 
                             alt="Selected Image" />
                        <button type="button" 
                                class="btn-remove" 
                                @click="removeImage(index)">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { useMessageStore } from '@/stores/message'
import { useAuthStore } from '@/stores/auth'
import { onMounted, ref } from 'vue'
import type { Message, conversations } from '../../stores/message'

export default {
    setup() {
        const BASE_URL = import.meta.env.VITE_API_URI as string;
        const messagesStore = useMessageStore()
        const authStore = useAuthStore()
        const messageDetails = ref<Message[]>([])
        const selectedUser = ref<null | conversations>(null)
        const messageContent = ref<string>('')
        const userId = authStore.userDetail.user?.id


        const images = ref<File[]>([]);
            const getInitials = (name: string) => {
            return name
                .split(' ')
                .map(word => word[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)
        }

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

        onMounted(() => {
            messagesStore.getAllMessages()
            
        })

        const loadMessageDetail = async (conversationUserId: string) => {
            await messagesStore.getMessageDetail(userId, conversationUserId)
            messageDetails.value = messagesStore.messageDetail

            // Update selected user and reset unread count
            const conversation = messagesStore.allMessages.find(
                (c) => c.userId === conversationUserId
            )
            if (conversation) {
                selectedUser.value = conversation
                conversation.is_read = true
                conversation.unreadCount = 0

                // Mark all messages as read
                messageDetails.value.forEach((message) => {
                    if (!message.is_read) {
                        message.is_read = true
                        messagesStore.markMessageAsRead(message._id)
                    }
                })
            }

            // Scroll to bottom after loading
            setTimeout(() => {
                const messagesContent = document.querySelector('.messages-content')
                if (messagesContent) {
                    messagesContent.scrollTop = messagesContent.scrollHeight
                }
            }, 100)
        }

        const sendMessage = async () => {
            if (messageContent.value.trim() || images.value.length > 0) {
                const formData = new FormData();
                formData.append('sender', userId);
                // Add null check for selectedUser.value
        if (selectedUser.value) {
            formData.append('recipient', selectedUser.value.userId);
        } else {
            // Handle the case when selectedUser.value is null
            console.error('selectedUser is null, cannot send message');
            return;
        }
                formData.append('content', messageContent.value);

                images.value.forEach((image) => {
                    formData.append('images', image);
                });

                await messagesStore.sendMessage(formData);

                // Update the conversation in the conversation list
                const conversation = messagesStore.allMessages.find(
                    (c) => c.userId === selectedUser.value?.userId
                );
                if (conversation) {
                    conversation.lastMessage = messageContent.value || " "
                    conversation.sentAt = new Date().toISOString(); // Update timestamp to current time
                    conversation.lastSenderId = userId;
                }
                messageContent.value = ''; // Clear input after sending
                images.value = []; // Clear selected images
            }
        };

        const formatTimeAgo = (sentAt: string) => {
            const sentDate = new Date(sentAt)
            const now = new Date()
            const diffMs = now.getTime() - sentDate.getTime()
            const diffMins = Math.floor(diffMs / 60000)
            const diffHours = Math.floor(diffMins / 60)
            const diffDays = Math.floor(diffHours / 24)

            if (diffMins < 1) return 'just now'
            if (diffMins < 60) return `${diffMins}m ago`
            if (diffHours < 24) return `${diffHours}h ago`
            return `${diffDays}d ago`
        }

        return {
            messagesStore,
            formatTimeAgo,
            messageDetails,
            selectedUser,
            loadMessageDetail,
            sendMessage,
            messageContent,
            userId,
            images,
            onFileChange,
            removeImage,
            getImagePreviewUrl,
            BASE_URL,
            getInitials

        }
    }
}
</script>

<style scoped>
.messages-container {
    height: calc(100vh - 60px);
    overflow: hidden;
}

.conversations-column,
.messages-column {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.message-preview-container {
    position: relative;
    width: 100%;
}

.unread-message {
    color: #000000;
    font-weight: bold;
}

.unread-badge {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    background-color: #ff4444;
    color: white;
    border-radius: 50%;
    min-width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: bold;
    padding: 0 6px;
}

.conversations-list {
    overflow-y: auto;
    flex-grow: 1;
}

.conversation-item {
    cursor: pointer;
    transition: background-color 0.2s;
}

.conversation-item:hover {
    background-color: #f8f9fa;
}

.conversation-item.active {
    background-color: #e9ecef;
}

.avatar-placeholder {
    width: 40px;
    height: 40px;
    background-color: #e9ecef;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.messages-content {
    flex-grow: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
}

.message {
    max-width: 75%;
    margin-bottom: 1rem;
}

.message.received .message-content {
    background-color: #f0f0f0;
    padding: 0.75rem;
    border-radius: 1rem;
    position: relative;
}

.message.sent {
    margin-left: auto;
}

.message.sent .message-content {
    background-color: #007bff;
    color: white;
    padding: 0.75rem;
    border-radius: 1rem;
    position: relative;
}

.message-time {
    display: block;
    font-size: 0.75rem;
    margin-top: 0.25rem;
    opacity: 0.8;
}

.message-input-container {
    background-color: white;
}

.conversation-item.unread {
    font-weight: bold;
    color: black;
}

.font-weight-bold {
    font-weight: bold;
}
message-images {
  display: flex;
  flex-wrap: wrap;
  margin-top: 0.5rem;
}

.message-image {
  max-width: 200px;
  max-height: 200px;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
  border-radius: 0.5rem;
}

.message-images-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
}

.image-preview-card {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.preview-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  display: block;
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
}

.btn-remove:hover {
  background-color: #dc3545;
  color: white;
}

.conversation-avatar {
    width: 48px;
    height: 48px;
    flex-shrink: 0;
    position: relative;
}

.avatar-image {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    background-color: #f8f9fa;
}

.avatar-placeholder {
    width: 100%;
    height: 100%;
    background-color: #e9ecef;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    color: #6c757d;
    font-size: 1rem;
}
</style>
